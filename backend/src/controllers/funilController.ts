import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Converte texto de preço (ex: "197,00", "R$ 197.00") em número de forma segura
function parsePreco(valor: any): number | undefined {
  if (valor === null || valor === undefined || valor === '') return undefined;
  const normalizado = String(valor).replace(/[^\d,.-]/g, '').replace(',', '.');
  const numero = parseFloat(normalizado);
  return Number.isNaN(numero) ? undefined : numero;
}

// Grava (substituindo tudo) as listas de dores, depoimentos e FAQ de um funil
async function salvarListasTsl(connection: any, funilId: number, paginaVendas: any) {
  const dores = Array.isArray(paginaVendas?.dores) ? paginaVendas.dores : [];
  const depoimentos = Array.isArray(paginaVendas?.depoimentos) ? paginaVendas.depoimentos : [];
  const faq = Array.isArray(paginaVendas?.faq) ? paginaVendas.faq : [];

  await connection.execute('DELETE FROM tsl_dores WHERE funil_id = ?', [funilId]);
  await connection.execute('DELETE FROM tsl_depoimentos WHERE funil_id = ?', [funilId]);
  await connection.execute('DELETE FROM tsl_faq WHERE funil_id = ?', [funilId]);

  for (let i = 0; i < dores.length; i++) {
    const d = dores[i];
    await connection.execute(
      `INSERT INTO tsl_dores (funil_id, ordem, titulo, texto) VALUES (?, ?, ?, ?)`,
      [funilId, i + 1, d?.titulo || '', d?.texto || null]
    );
  }

  for (let i = 0; i < depoimentos.length; i++) {
    const dep = depoimentos[i];
    await connection.execute(
      `INSERT INTO tsl_depoimentos (funil_id, ordem, nome, cargo, texto) VALUES (?, ?, ?, ?, ?)`,
      [funilId, i + 1, dep?.nome || '', dep?.cargo || null, dep?.texto || null]
    );
  }

  for (let i = 0; i < faq.length; i++) {
    const f = faq[i];
    await connection.execute(
      `INSERT INTO tsl_faq (funil_id, ordem, pergunta, resposta) VALUES (?, ?, ?, ?)`,
      [funilId, i + 1, f?.pergunta || '', f?.resposta || null]
    );
  }
}

// 1. Criar um novo funil
export const criarFunil = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const { nome, slug, perguntas, paginaVendas, redirect_url } = req.body;

    console.log('📦 DADOS RECEBIDOS AO CRIAR FUNIL:');
    console.log(JSON.stringify(req.body, null, 2));

    const nomeValido = nome || '';
    const slugValido = slug || '';

    await connection.beginTransaction();

    // Insere o funil principal
    const [funilResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO funis (nome, slug) VALUES (?, ?)',
      [nomeValido, slugValido]
    );

    const funilId = funilResult.insertId;

    // Inserção das Perguntas do Quiz
    if (perguntas && Array.isArray(perguntas)) {
      for (let i = 0; i < perguntas.length; i++) {
        const p = perguntas[i];

        const enunciadoValido =
          p.enunciado !== undefined && p.enunciado !== null
            ? p.enunciado
            : '';

        const imagemUrlValida =
          p.imagem_url !== undefined && p.imagem_url !== null
            ? p.imagem_url
            : null;

        const opcoesValidas =
          p.opcoes && Array.isArray(p.opcoes)
            ? p.opcoes
            : [];

        await connection.execute(
          `INSERT INTO perguntas
            (funil_id, ordem, enunciado, imagem_url, opcoes)
           VALUES (?, ?, ?, ?, ?)`,
          [
            funilId,
            i + 1,
            enunciadoValido,
            imagemUrlValida,
            JSON.stringify(opcoesValidas),
          ]
        );
      }
    }

    // Extração segura dos dados da Página de Vendas enviados pelo Frontend
    const blocoLead = paginaVendas?.blocoLead || {};
    const blocoCorpo = paginaVendas?.blocoCorpo || {};
    const blocoPitch = paginaVendas?.blocoPitch || {};
    const blocoCta = paginaVendas?.blocoCta || {
      link: redirect_url || '',
      textoBotao: 'GARANTIR AGORA'
    };

    // Inserção da Página de Vendas mapeando corretamente para as colunas reais do banco
    await connection.execute(
      `INSERT INTO paginas_vendas
        (funil_id, headline, subheadline, video_url, texto_corpo, nome_produto, texto_oferta, preco_texto, cta_texto, cta_link, cor_botao, urgencia_texto, countdown_ativo, countdown_horas, countdown_minutos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        funilId,
        blocoLead?.titulo || '',                                  // headline
        blocoLead?.subtitulo || null,                             // subheadline
        blocoCorpo?.videoUrl || null,                             // video_url
        blocoCorpo?.texto || null,                                // texto_corpo
        blocoPitch?.nomeProduto || null,                          // nome_produto
        blocoPitch?.ofertaTexto || null,                          // texto_oferta
        blocoPitch?.preco !== undefined && blocoPitch?.preco !== null
          ? String(blocoPitch.preco)
          : null,                                                 // preco_texto
        blocoCta?.textoBotao || 'Comprar Agora',                  // cta_texto
        blocoCta?.link || redirect_url || '',                     // cta_link (obrigatório)
        blocoCta?.corBotao || '#10b981',                          // cor_botao
        paginaVendas?.urgenciaTexto || 'Oferta por tempo limitado', // urgencia_texto
        paginaVendas?.countdownAtivo === false ? 0 : 1,            // countdown_ativo
        paginaVendas?.countdownHoras ?? 2,                         // countdown_horas
        paginaVendas?.countdownMinutos ?? 41,                      // countdown_minutos
      ]
    );

    await salvarListasTsl(connection, funilId, paginaVendas);

    await connection.commit();

    res.status(201).json({
      message: 'Funil criado com sucesso!',
      funilId,
      slug,
    });
  } catch (error: any) {
    await connection.rollback();

    console.error('🔥 ERRO COMPLETO DO MYSQL/BACKEND:', error.message);
    console.error('🔍 STACK DO ERRO:', error.stack);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        error: 'Já existe um funil cadastrado com este slug.',
      });
    }

    res.status(500).json({
      error: 'Erro ao criar o funil',
      details: error.message,
    });
  } finally {
    connection.release();
  }
};


// 2. Listar todos os funis
export const listarFunis = async (req: Request, res: Response) => {
  try {
    const [funis] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nome, slug, criado_em FROM funis ORDER BY id DESC'
    );

    res.json(funis);
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro ao listar os funis',
      details: error.message,
    });
  }
};


// 3. Buscar um funil por slug (Ajustado para remontar a estrutura esperada pelo Front)
export const obterFunilPorSlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const [funis] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM funis WHERE slug = ?',
      [slug]
    );

    if (funis.length === 0) {
      return res.status(404).json({
        error: 'Funil não encontrado',
      });
    }

    const funil = funis[0];

    const [perguntas] = await pool.execute<RowDataPacket[]>(
      `SELECT
        id,
        ordem,
        enunciado,
        imagem_url,
        opcoes
       FROM perguntas
       WHERE funil_id = ?
       ORDER BY ordem ASC`,
      [funil.id]
    );

    const perguntasFormatadas = perguntas.map((pergunta) => ({
      ...pergunta,
      opcoes:
        typeof pergunta.opcoes === 'string'
          ? JSON.parse(pergunta.opcoes)
          : pergunta.opcoes || [],
    }));

    const [paginas] = await pool.execute<RowDataPacket[]>(
      `SELECT
        headline,
        subheadline,
        video_url,
        texto_corpo,
        nome_produto,
        texto_oferta,
        preco_texto,
        cta_texto,
        cta_link,
        cor_botao,
        urgencia_texto,
        countdown_ativo,
        countdown_horas,
        countdown_minutos
       FROM paginas_vendas
       WHERE funil_id = ?`,
      [funil.id]
    );

    const [dores] = await pool.execute<RowDataPacket[]>(
      `SELECT titulo, texto FROM tsl_dores WHERE funil_id = ? ORDER BY ordem ASC`,
      [funil.id]
    );

    const [depoimentos] = await pool.execute<RowDataPacket[]>(
      `SELECT nome, cargo, texto FROM tsl_depoimentos WHERE funil_id = ? ORDER BY ordem ASC`,
      [funil.id]
    );

    const [faq] = await pool.execute<RowDataPacket[]>(
      `SELECT pergunta, resposta FROM tsl_faq WHERE funil_id = ? ORDER BY ordem ASC`,
      [funil.id]
    );

    // Reconstrói o formato de blocos que o frontend espera receber
    const p = paginas[0] || {};
    const paginaVendasFormatada = {
      blocoLead: {
        titulo: p.headline || '',
        subtitulo: p.subheadline || ''
      },
      blocoCorpo: {
        videoUrl: p.video_url || '',
        texto: p.texto_corpo || ''
      },
      blocoPitch: {
        nomeProduto: p.nome_produto || '',
        ofertaTexto: p.texto_oferta || '',
        preco: parsePreco(p.preco_texto)
      },
      blocoCta: {
        textoBotao: p.cta_texto || 'GARANTIR AGORA',
        link: p.cta_link || '',
        corBotao: p.cor_botao || '#10b981'
      },
      urgenciaTexto: p.urgencia_texto || 'Oferta por tempo limitado',
      countdownAtivo: p.countdown_ativo === 1 || p.countdown_ativo === true,
      countdownHoras: p.countdown_horas ?? 2,
      countdownMinutos: p.countdown_minutos ?? 41,
      dores,
      depoimentos,
      faq,
    };

    res.json({
      id: funil.id,
      nome: funil.nome,
      slug: funil.slug,
      perguntas: perguntasFormatadas,
      paginaVendas: paginaVendasFormatada,
    });
  } catch (error: any) {
    console.error('🔥 Erro ao buscar funil:', error);

    res.status(500).json({
      error: 'Erro ao buscar o funil',
      details: error.message,
    });
  }
};


// 4. Atualizar um funil existente (PUT)
export const atualizarFunil = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { nome, slug, perguntas, paginaVendas, redirect_url } = req.body;

    const [funis] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM funis WHERE id = ?',
      [id]
    );

    if (funis.length === 0) {
      return res.status(404).json({
        error: 'Funil não encontrado para atualização',
      });
    }

    await connection.beginTransaction();

    await connection.execute(
      'UPDATE funis SET nome = ?, slug = ? WHERE id = ?',
      [nome || '', slug || '', id]
    );

    if (perguntas && Array.isArray(perguntas)) {
      await connection.execute(
        'DELETE FROM perguntas WHERE funil_id = ?',
        [id]
      );

      for (let i = 0; i < perguntas.length; i++) {
        const p = perguntas[i];

        const enunciadoValido =
          p.enunciado !== undefined && p.enunciado !== null
            ? p.enunciado
            : '';

        const imagemUrlValida =
          p.imagem_url !== undefined && p.imagem_url !== null
            ? p.imagem_url
            : null;

        const opcoesValidas =
          p.opcoes && Array.isArray(p.opcoes)
            ? p.opcoes
            : [];

        await connection.execute(
          `INSERT INTO perguntas
            (funil_id, ordem, enunciado, imagem_url, opcoes)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            i + 1,
            enunciadoValido,
            imagemUrlValida,
            JSON.stringify(opcoesValidas),
          ]
        );
      }
    }

    const blocoLead = paginaVendas?.blocoLead || {};
    const blocoCorpo = paginaVendas?.blocoCorpo || {};
    const blocoPitch = paginaVendas?.blocoPitch || {};
    const blocoCta = paginaVendas?.blocoCta || {
      link: redirect_url || '',
      textoBotao: 'GARANTIR AGORA'
    };

    await connection.execute(
      `UPDATE paginas_vendas
       SET
         headline = ?,
         subheadline = ?,
         video_url = ?,
         texto_corpo = ?,
         nome_produto = ?,
         texto_oferta = ?,
         preco_texto = ?,
         cta_texto = ?,
         cta_link = ?,
         cor_botao = ?,
         urgencia_texto = ?,
         countdown_ativo = ?,
         countdown_horas = ?,
         countdown_minutos = ?
       WHERE funil_id = ?`,
      [
        blocoLead?.titulo || '',
        blocoLead?.subtitulo || null,
        blocoCorpo?.videoUrl || null,
        blocoCorpo?.texto || null,
        blocoPitch?.nomeProduto || null,
        blocoPitch?.ofertaTexto || null,
        blocoPitch?.preco !== undefined && blocoPitch?.preco !== null
          ? String(blocoPitch.preco)
          : null,
        blocoCta?.textoBotao || 'Comprar Agora',
        blocoCta?.link || redirect_url || '',
        blocoCta?.corBotao || '#10b981',
        paginaVendas?.urgenciaTexto || 'Oferta por tempo limitado',
        paginaVendas?.countdownAtivo === false ? 0 : 1,
        paginaVendas?.countdownHoras ?? 2,
        paginaVendas?.countdownMinutos ?? 41,
        id,
      ]
    );

    await salvarListasTsl(connection, Number(id), paginaVendas);

    await connection.commit();

    res.json({
      message: 'Funil atualizado com sucesso!',
    });
  } catch (error: any) {
    await connection.rollback();

    console.error('🔥 Erro ao atualizar funil:', error);

    res.status(500).json({
      error: 'Erro ao atualizar o funil',
      details: error.message,
    });
  } finally {
    connection.release();
  }
};


// 5. Deletar um funil por ID
export const deletarFunil = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM funis WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Funil não encontrado',
      });
    }

    res.json({
      message: 'Funil removido com sucesso!',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro ao deletar o funil',
      details: error.message,
    });
  }
};


// 6. Registrar Lead e Respostas do Quiz
export const salvarRespostaQuiz = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();

  try {
    const { slug } = req.params;
    const { nome, email, whatsapp, respostas } = req.body;

    const [funis] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM funis WHERE slug = ?',
      [slug]
    );

    if (funis.length === 0) {
      return res.status(404).json({
        error: 'Funil não encontrado',
      });
    }

    const funilId = funis[0].id;

    await connection.beginTransaction();

    const [leadResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO leads (funil_id, nome, email, whatsapp) VALUES (?, ?, ?, ?)',
      [
        funilId,
        nome || null,
        email || null,
        whatsapp || null,
      ]
    );

    const leadId = leadResult.insertId;

    if (respostas && Array.isArray(respostas)) {
      for (const r of respostas) {
        const respostaTextoValida =
          r.respostaTexto !== undefined &&
          r.respostaTexto !== null
            ? r.respostaTexto
            : '';

        await connection.execute(
          `INSERT INTO respostas_quiz
            (lead_id, pergunta_id, resposta_texto)
           VALUES (?, ?, ?)`,
          [
            leadId,
            r.perguntaId,
            respostaTextoValida,
          ]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      message: 'Respostas e lead gravados com sucesso!',
      leadId,
    });
  } catch (error: any) {
    await connection.rollback();

    res.status(500).json({
      error: 'Erro ao salvar respostas do quiz',
      details: error.message,
    });
  } finally {
    connection.release();
  }
};


// 7. Listar todos os leads e respostas de um funil específico (Painel Admin)
export const listarLeadsDoFunil = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [funis] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nome FROM funis WHERE id = ?',
      [id]
    );

    if (funis.length === 0) {
      return res.status(404).json({
        error: 'Funil não encontrado',
      });
    }

    const [leads] = await pool.execute<RowDataPacket[]>(
      `SELECT
        id,
        nome,
        email,
        whatsapp,
        criado_em
       FROM leads
       WHERE funil_id = ?
       ORDER BY id DESC`,
      [id]
    );

    const leadsComRespostas = await Promise.all(
      leads.map(async (lead) => {
        const [respostas] = await pool.execute<RowDataPacket[]>(
          `SELECT
            r.pergunta_id,
            p.enunciado,
            r.resposta_texto,
            r.respondido_em
           FROM respostas_quiz r
           INNER JOIN perguntas p ON p.id = r.pergunta_id
           WHERE r.lead_id = ?
           ORDER BY p.ordem ASC`,
          [lead.id]
        );

        return {
          ...lead,
          respostas,
        };
      })
    );

    res.json({
      funil: funis[0],
      totalLeads: leadsComRespostas.length,
      leads: leadsComRespostas,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Erro ao listar os leads do funil',
      details: error.message,
    });
  }
};
import { Router } from 'express';
import { 
  criarFunil, 
  listarFunis, 
  obterFunilPorSlug, 
  atualizarFunil, 
  deletarFunil,
  salvarRespostaQuiz,
  listarLeadsDoFunil // Importado aqui
} from '../controllers/funilController.js';

const router = Router();

router.post('/funis', criarFunil);
router.get('/funis', listarFunis);
router.get('/funis/:slug', obterFunilPorSlug);
router.put('/funis/:id', atualizarFunil);
router.delete('/funis/:id', deletarFunil);

// Rotas do visitante e leads
router.post('/funis/:slug/responder', salvarRespostaQuiz);
router.get('/funis/:id/leads', listarLeadsDoFunil); // Nova rota do Admin

export default router;
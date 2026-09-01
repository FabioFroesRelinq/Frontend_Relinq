import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'funil_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function testarConexao() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com o banco de dados MySQL realizada com sucesso!');
    connection.release();
  } catch (error: any) {
    console.error('❌ Erro ao conectar com o MySQL:', error.message);
  }
}
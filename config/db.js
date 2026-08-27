

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // Carica le variabili dal .env

const useSSL = process.env.NODE_ENV ==="product";
console.log(process.env.NODE_ENV);
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  multipleStatements: true,
   ssl: {
     ssl: useSSL ? { rejectUnauthorized: false } : false
  } 
});

// Test connessione (opzionale ma utile)
/* pool.getConnection()
  .then(conn => {
    console.log("✅ Connessione MySQL riuscita");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Errore connessione MySQL:", err);
  }); */

export default pool;


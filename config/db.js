import dotenv from "dotenv";

import mysql from "mysql2/promise";

// Debug temporaneo per verificare cosa vede effettivamente Node.js
console.log("--- DEBUG PARAMETRI ---");
console.log("HOST LETTO:", process.env.DB_HOST);
console.log("PORTA LETTA:", process.env.DB_PORT);
console.log("SSL ATTIVO?:", process.env.DB_SSL);
console.log("-----------------------");

dotenv.config(); // Carica le variabili dal .env

//const useSSL = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "product";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 13241,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  multipleStatements: true,
  // Legge la stringa dal file .env o da Render
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
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


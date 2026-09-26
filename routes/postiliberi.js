import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

function generaCodiceData() {
  const ora = new Date();

  const stringaData = ora.getFullYear() +
    String(ora.getMonth() + 1).padStart(2, '0') +
    String(ora.getDate()).padStart(2, '0') +
    String(ora.getHours()).padStart(2, '0') +
    String(ora.getMinutes()).padStart(2, '0') +
    String(ora.getSeconds()).padStart(2, '0');

  // Aggiungiamo i millisecondi (3 cifre) per una precisione estrema
  const millisecondi = String(ora.getMilliseconds()).padStart(3, '0');

  return `${stringaData}-${millisecondi}`;
  // Esempio di output: "20260929124530125" (29 Settembre 2026, 12:45:30 e 125ms)
}



router.get('/lettiLiberiSetting/:IDSetting', async (req, res) => {
  const { IDSetting } = req.params;
  const sql = `SELECT * FROM posti_letto_liberi pl 
WHERE pl.idSetting=? AND attivo =1`
  // 1) Aggiorno il paziente
  try {
    const [rows] = await pool.query(sql, [IDSetting]);
    
    if (rows.length === 0) {
      return res.json([{ numero: 0, setting: "Nessun letto libero" }]);
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json([{ error: "Errore nel ricecere id dati posti liberi" }]);
  }
});



router.get('/getProgrammazione/:IDUtente', async (req, res) => {
  const { IDUtente } = req.params;
  const conn = await pool.getConnection();
 
  const sqlSettings = `SELECT 
    st.nomeAzienda, 
    s.setting, 
    p.idSetting, 
    p.idPostoLibero,
    -- Conta quanti record hanno 'M' (Uomini)
    SUM(CASE WHEN p.sesso = 2 THEN 1 ELSE 0 END) AS totale_uomini,
    -- Conta quanti record hanno 'F' (Donne)
    SUM(CASE WHEN p.sesso = 1 THEN 1 ELSE 0 END) AS totale_donne,   
    COUNT(*) AS totale_posti,
     SUM(CASE WHEN p.dataProg IS NULL THEN 0 ELSE 1 END) AS totale_prenotati
FROM posti_letto_liberi p 
INNER JOIN setting s ON s.IDSetting = p.idSetting
INNER JOIN strutture st ON st.idStruttura = s.IDStruttua
WHERE p.idUtenteProg = ? AND p.attivo = 1
GROUP BY st.nomeAzienda, s.setting, p.idSetting;`;
  try {
    conn.beginTransaction();
    const [rows] = await conn.query(sqlSettings, [IDUtente]);
    conn.commit()
    
    if (conn) conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    conn.rollback();
    conn.release()
    res.status(500).json([{ error: "Errore nel recupero dei dati del setting" }]);
  }
});


router.post('/salvaDatiLetto', async (req, res) => {
  const { IDPostoLetto, IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza, sessoPz } = req.body;
  const postiletto = [sessoPz, IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza, 1, IDPostoLetto];

  try {
    const [rows] = await pool.query(`SELECT * FROM paziente
                              WHERE paziente.IDPostoLetto= ? AND (
        paziente.dataTrasf IS NULL
        OR paziente.dataTrasf = 0
        OR paziente.dataTrasf = '0000-00-00'
      );`, [IDPostoLetto]);


    if (rows) {
      const [info] = await pool.query(`UPDATE paziente 
       SET dataTrasf=? 
       WHERE IDPostoLetto=?`, [oggi, IDPostoLetto]);
    }
    
    const [info] = await pool.query(
      `UPDATE postiletto 
       SET sessoPz=?,IDSetting=?, IDStatoLetto=?, IDTipoLetto=?, numeroStanza=?, attivo=?
       WHERE IDPostoLetto=?`,
      [...postiletto]
    );

    res.json({
      message: 'Dati aggiornati con successo',
      updated: info.affectedRows
    });
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.post('/occupaLetto', async (req, res) => {
  const { idPostoLibero, dataOcc } = req.body;
  
  const sql = `UPDATE posti_letto_liberi SET dataOcc = ?, attivo = 0 WHERE idPostoLibero = ?`;
 
  try {
    const [result] = await pool.query(sql, [dataOcc, idPostoLibero]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nessun letto trovato con l'ID specificato" });
    }
    res.json({ message: "Letto occupato con successo" });
  } catch (err) {
    console.error("Errore durante l'occupazione del letto:", err);
    return res.status(500).json({ error: "Errore nel aggiornare il letto" });
  }
});
export default router;

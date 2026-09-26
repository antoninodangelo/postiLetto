import express from 'express';
import path from 'path';
import pool from '../config/db.js';
import { constructNow, format } from "date-fns";
const oggi = format(new Date(), "yyyy-MM-dd HH:mm:ss");
import { fileURLToPath } from 'url';


const router = express.Router();

// Ricrea __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HOME PAGE

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


router.get('/numeroLettiLiberi/:IDUtente/:livelloAccesso', async (req, res) => {
  try {
    const { IDUtente, livelloAccesso} = req.params;
    
   
    // 1) Aggiorno il paziente
    
    let rows=[];
    if(livelloAccesso >=50 ){
      [rows] = await pool.query(
              
      "SELECT  s.setting AS `SETTING`, COUNT(*) AS `LETTI LIBERI` FROM postiletto p "+
      "INNER JOIN setting s ON s.IDSetting = p.IDSetting INNER JOIN zone z ON z.IDZona = s.IDZona  "+
      "WHERE p.IDStatoLetto = 14 AND s.ospedaliero = 0 AND s.setting NOT LIKE 'boarding%' GROUP BY s.setting;",
      []
    );
  }else{
      [rows] = await pool.query(
        "SELECT COUNT(*) AS `LETTI LIBERI`,s.setting AS `SETTING` FROM postiletto p "+
"JOIN setting s ON s.IDSetting = p.IDSetting JOIN utenti_setting us ON us.IDSetting = s.IDSetting "+
"JOIN utenti u ON u.IDUtente = us.IDUtente "+
"WHERE p.IDStatoLetto = 14 AND s.ospedaliero = 0 AND LOWER(s.setting) NOT LIKE 'boarding%' AND u.IDUtente = ? "+
"GROUP BY p.IDSetting;",
        [IDUtente]
      );
    }
    if(rows.length === 0){
      return res.json([{ numero: 0, setting: "Nessun letto libero" }]);
    } else {
      res.json(rows);
    }
    // 3) Risposta al client
    //  
  } catch (err) {
    console.error(err);
    res.status(500).json([{ error: "Errore nel ricecere id dati posti liberi" }]);
  }
});
router.get('/lettiLiberiSetting/:IDSetting', async (req, res) => {
    const  {IDSetting} = req.params;
    const sql =`SELECT pl.IDPostoLetto, pl.numeroLetto, pl.sessoPz FROM postiletto pl
      INNER JOIN setting s ON s.IDSetting = pl.IDSetting
      WHERE pl.IDStatoLetto=14 AND s.IDSetting = ?`
    // 1) Aggiorno il paziente
    try{
    const [rows]= await pool.query(sql,[IDSetting]);   
    if(rows.length === 0){
      return res.json([{ numero: 0, setting: "Nessun letto libero" }]);
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json([{ error: "Errore nel ricecere id dati posti liberi" }]);
  }
});
router.get('/lettiOccupatiGenerale/:livelloAccesso', async (req, res) => {
    const { livelloAccesso } = req.params;
    
    const sql =`SELECT p.IDPaziente,z.zona,s.setting, concat(p.cognomePaziente," ", p.nomePaziente) AS nome,  
                pl.numeroLetto from paziente p 
                INNER JOIN postiletto pl ON p.IDPostoLetto= pl.IDPostoLetto
                INNER JOIN setting s ON s.IDSetting= pl.IDSetting
                INNER JOIN zone z ON s.IDZona = z.IDZona
                WHERE ISNULL (p.dataDimissione)  and p.attivo =1
                GROUP BY zona, setting, numeroLetto`;
    // 1) Aggiorno il paziente
    try{
    const [rows]= await pool.query(sql,[]);   
    if(rows.length === 0){
      return res.json([{ numero: 0, setting: "Nessun letto Occupato" }]);
    } else {
    
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json([{ error: "Errore nel ricecere id dati posti liberi" }]);
  }
});
// STATO LETTI
router.get('/statoletti', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM stato_postiletto 
      WHERE attivo = 1
      ORDER BY ordine ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// AZIENDE
router.get('/aziende', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aziende');
    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});


router.post('/prolungaRicovero', async (req, res) => {
  console.log(req.body);
  const { IDPaziente, dataDimissione } = req.body;

  try {
    // 1. CORREZIONE: L'ordine dei parametri nell'array deve seguire esattamente l'ordine dei '?' nella query SQL
    const sql = "UPDATE paziente SET dataDimissione = ? WHERE IDPaziente = ?";
    await pool.execute(sql, [dataDimissione, IDPaziente]);

    // 2. CORREZIONE: Devi inviare una risposta di successo al client
    return res.status(200).json({ success: true, message: "Ricovero prolungato con successo" });

  } catch (error) {
    console.error("Errore database:", error); // Utile per il debug sul server
    
    // 3. CORREZIONE: Non lanciare un "throw new Error", ma rispondi al client con un codice di errore HTTP (500)
    return res.status(500).json({ success: false, error: "Errore nell'aggiornare la data di ricovero" });
  }
});

// ZONE
router.get("/pazientiPerSetting/:IDSetting", async(req, res) => {
    const { IDSetting } = req.params;
    
    let dettaglio ="";
    (IDSetting === "7")? dettaglio = "AND p.IDPostoLetto=181": dettaglio= "AND s.IDSetting=?";
    const sql = `
         SELECT 
      p.IDPaziente,
      p.nomePaziente,
      p.IDPostoLetto,
      p.cognomePaziente,
      p.sesso,
      DATE_FORMAT(p.dataNascita, '%d/%m/%Y') AS dataNascita,
      DATE_FORMAT(p.dataDimissione, '%d/%m/%Y') AS dataDimissione,
      l.numeroLetto,
      l.IDPostoLetto,
      s.setting
  FROM paziente p        
  LEFT JOIN postiletto l ON l.IDPostoLetto = p.IDPostoLetto
  INNER JOIN setting s ON s.IDSetting = l.IDSetting
  WHERE (p.dataDimissione IS NULL OR p.dataDimissione >= CURDATE()) and p.attivo =1 ${dettaglio}
  ORDER BY p.cognomePaziente, p.nomePaziente
    `;
    
    const [results]= await pool.query(sql, [IDSetting])
      
        res.json(results);
    });

router.get("/pazientiRicoverati", async(req, res) => {
    try{
    const sql = `
        SELECT p.IDPaziente,z.zona,s.setting, concat(p.cognomePaziente," ", p.nomePaziente) AS nome,  
        pl.numeroLetto from paziente p 
        INNER JOIN postiletto pl ON p.IDPostoLetto= pl.IDPostoLetto
        INNER JOIN setting s ON s.IDSetting= pl.IDSetting
        INNER JOIN zone z ON s.IDZona = z.IDZona
        WHERE ISNULL (p.dataDimissione) 
        GROUP BY zona, setting, numeroLetto
    `;
    
      const [rows]= await pool.query(sql, [])
        
        res.json(rows);

        } catch (err) {
        console.error('Errore query:', err);
        res.status(500).json({ error: 'Errore server' });
      }
    });
// SETTING
router.get('/setting/:ID', async (req, res) => {
  const IDZona = req.params.ID;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM setting WHERE IDZona = ?',
      [IDZona]
    );
    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.get('/settingAppartenenza/:idZona', async (req, res) => {
  const idZona = req.params.idZona;
 
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT 
    s.IDSetting, 
    z.zona AS 'ZONA', 
    s.setting AS 'setting', 
    z.IDZona
FROM setting s
INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
INNER JOIN zone z ON z.IDZona = s.IDZona
WHERE s.ospedaliero = 1 
  AND z.IDZona = ?
ORDER BY s.setting ASC; 
` ,
      [idZona]
    );
    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.get('/settingUtente/:IDUtente/:livelloAccesso', async (req, res) => {
  const IDUtente = req.params.IDUtente;
  const livelloAccesso = req.params.livelloAccesso;
  let sql='';
  try {
    /* if(livelloAccesso>=50){
      sql=`SELECT s.*, a.nomeAzienda
FROM setting s
INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
INNER JOIN utenti u ON u.IDUtente = us.IDUtente
INNER JOIN zone z ON z.IDZona = s.IDZona
INNER JOIN aziende_zone az ON az.idZona = z.IDZona
INNER JOIN aziende a ON a.IDAzienda = az.idAzienda
WHERE s.ospedaliero = 0;`;
    }
    else{
      sql=`SELECT s.*, a.nomeAzienda
    FROM setting s
    INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
    INNER JOIN utenti u ON u.IDUtente = us.IDUtente
    INNER JOIN zone z ON z.IDZona = s.IDZona
    WHERE u.IDUtente = ?  AND s.ospedaliero =0;`
    } */
    const [rows] = await pool.query(`
      SELECT *, a.nomeAzienda
    FROM setting s
    INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
    INNER JOIN utenti u ON u.IDUtente = us.IDUtente
    INNER JOIN zone z ON z.IDZona = s.IDZona
    INNER JOIN aziende a ON a.IDAzienda = z.IDAzienda
    WHERE u.IDUtente = ?  AND s.ospedaliero =0;`, [IDUtente]);
    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
})

// LETTI
router.get('/letti/:ID', async (req, res) => {
  const IDSetting = req.params.ID;
 
  try {
    const [rows] = await pool.query(
      `SELECT  
    p.IDSetting,
    p.IDPostoLetto,
    p.numeroLetto,
    p.IDStatoLetto,
    p.numeroStanza,
    p.sessoPz,
    paziente.IDPaziente,
    paziente.nomePaziente,
    paziente.cognomePaziente,
    paziente.dataNascita,
    paziente.sesso,
    paziente.dataTrasf,
    paziente.IDSettingDestinazione,
    paziente.dataDimissione
FROM postiletto p
LEFT JOIN paziente  
    ON paziente.IDPostoLetto = p.IDPostoLetto
    AND paziente.attivo = 1
    AND (paziente.dataDimissione IS NULL)
WHERE p.IDSetting = ?
  AND p.attivo = 1
ORDER BY p.numeroStanza, p.numeroLetto;
`,
      [IDSetting]
    );

    return res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    return res.status(500).json({ error: 'Errore server' });
  }
});
// SALVATAGGIO LETTO
router.post('/Paziente/:livelloAccesso', async (req, res) => {
  const livelloAccesso = req.params.livelloAccesso;
  
  
  const { IDPostoLetto, nomePaziente,cognomePaziente, dataNascita, sesso, settingDestinazione, dataTrasf,problemiAperti, settingApp } = req.body;
  const nuovoPaziente = [generaCodiceData(),IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso, null, settingDestinazione, problemiAperti, settingApp];
  let conn = null;
  try {
    conn = pool.getConnection();
    (await conn).beginTransaction();
    // prima di fare l'inserimento devo controllare nella tabella pazienti che non siano presenti pazienti in quel letto senza data di trasf.
    const [rowsPzPresente] = await pool.query(`SELECT  
    p.IDSetting,
    p.IDPostoLetto,
    p.numeroLetto,
    p.IDStatoLetto,
    p.numeroStanza,
    paziente.IDPaziente,
    paziente.nomePaziente,
    paziente.cognomePaziente,
    paziente.dataNascita,
    paziente.sesso,
    paziente.dataTrasf,
    paziente.IDSettingDestinazione,
    paziente.dataDimissione
FROM postiletto p
LEFT JOIN paziente  
    ON paziente.IDPostoLetto = p.IDPostoLetto
    AND paziente.attivo = 1
    AND (paziente.dataDimissione IS NULL OR paziente.dataDimissione =0)
WHERE p.IDSetting = ?
  AND p.attivo = 1
ORDER BY p.numeroStanza, p.numeroLetto;
`, [IDPostoLetto]);
    
    if(rowsPzPresente.length >0){
      const [rows]= await conn.query('UPDATE paziente set dataDimissione=? where IDPostoLetto = ? and IDPaziente = ?',[oggi,IDPostoLetto,rowsPzPresente[0].IDPaziente])
      const [info]= await conn.query('UPDATE postiletto set IDStatoLetto=16 where IDPostoletto =?',[IDPostoLetto])
    }
    
    // SE abbiamo rowsPzPresente devo inserire la data di trasf. nella tupla troavata e eseguire l'inserimeto

    const [info] = await conn.query(`INSERT INTO paziente (idRicovero,IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso,dataDimissione,IDSettingDestinazione,problemiAperti,IDProvenienza)
      VALUES (?,?,?, ?,?,?,?,?,?,?)`, nuovoPaziente);
    if(info){
      const [info1]= await conn.query('UPDATE postiletto set IDStatoLetto=16 where IDPostoletto =?',[IDPostoLetto]);
    }
    (await conn).commit();
    (await conn).release()
    res.json({
      message: 'Dati aggiornati con successo',
      updated: info.affectedRows
    });
  } catch (err) {
    if(conn){
      (await conn).rollback()
      (await conn).release();
    }
    console.error('Errore query:', err);
    return res.status(500).json({ error: 'Errore server' });
  }

});
router.post('/Letto', async (req, res) => {
  const { IDPostoLetto, IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza } = req.body;
  const postiletto = [IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza, 1, IDPostoLetto];

  try {
    const [rows] = await pool.query(`SELECT * FROM paziente
                              WHERE paziente.IDPostoLetto= ? AND (
        paziente.dataDimissione IS NULL
        OR paziente.dataDimissione = 0
        OR CAST(paziente.dataDimissione AS CHAR) = '0000-00-00' 
        
      );`, [IDPostoLetto]);
      
   
    if (rows.length > 0) {
     
      const [info] = await pool.query(`UPDATE paziente p
       SET p.dataTrasf=NOW(),p.IDSettingDestinazione=?, IDProvenienza =?, dataDimissione =?, attivo=0
       WHERE IDPaziente=?`, [IDSetting,IDSetting,oggi, rows[0].IDPaziente]);
    }

    const [info] = await pool.query(
      `UPDATE postiletto 
       SET IDSetting=?, IDStatoLetto=?, IDTipoLetto=?, numeroStanza=?, attivo=? 
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
router.get('/getStatoPazienti', async (req, res) => {
  try {
    const result = await pool.query('SELECT p.IDStatoPaziente, p.stato FROM stato_paziente p WHERE attivo =1');

    res.json({
      message: "Dati Stato Pazienti estratto correttamente",
      dati: result
    })
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore in estrarre gli stati del paziente' });
  }
})
router.post('/salvaDatiPaziente/:livelloAccesso', async (req, res) => {
  const livelloAccesso = req.params.livelloAccesso;
  
  const { 
    IDPostoLetto, 
    nomePaziente, 
    cognomePaziente, 
    dataNascita, 
    sesso, 
    settingDestinazione, 
    dataTrasf, 
    problemiAperti, 
    settingApp, 
    dataDimissione 
  } = req.body;

  // Generiamo la data odierna nel formato corretto (es. YYYY-MM-DD) per la variabile "oggi"
  const oggi = new Date().toISOString().slice(0, 10);

  // Mappatura corretta dei dati per l'inserimento
  const condiceGenerato =  generaCodiceData();
  const nuovoPaziente = [
   condiceGenerato, 
    IDPostoLetto, 
    nomePaziente, 
    cognomePaziente, 
    dataNascita, 
    sesso, 
    dataDimissione, 
    dataDimissione, // dataDimissioneControllo
    settingDestinazione, 
    problemiAperti, 
    settingApp
  ];
const tracking = [condiceGenerato, 1, 1, format(new Date(),'yyyy-MM-dd'), format(new Date(),'yyyy-MM-dd')]
  const conn = await pool.getConnection();
 
  try {
    await conn.beginTransaction();

    // 1. Controllo pz presente (Usa "conn" e non "pool" per rimanere nella transazione)
    const [rowsPzPresente] = await conn.query(
      `SELECT IDPaziente FROM paziente 
       WHERE IDPostoLetto = ? AND (dataTrasf IS NULL OR dataTrasf = 0 OR dataTrasf = '')`, 
      [IDPostoLetto]
    );
    
    // 2. Se c'è un paziente, lo "dimettiamo" liberando virtualmente il letto
    if (rowsPzPresente.length > 0) {
      await conn.query(
        'UPDATE paziente SET dataDimissione = ? WHERE IDPostoLetto = ? AND IDPaziente = ?',
        [oggi, IDPostoLetto, rowsPzPresente[0].IDPaziente]
      );
      
      await conn.query(
        'UPDATE postiletto SET IDStatoLetto = 16, sessoPz = ? WHERE IDPostoletto = ?',
        [sesso, IDPostoLetto]
      );
    }
    
    // 3. Inserimento del nuovo paziente
    const [info] = await conn.query(
      `INSERT INTO paziente (idRicovero, IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso, dataDimissione, dataDimissioneControllo, IDSettingDestinazione, problemiAperti, IDProvenienza)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      nuovoPaziente
    );
    
    const [ info1]= await conn.query(`INSERT INTO tracking_paziente (idRicovero, idStato, IDInseritore, dataTrac, dataNuovaDim) VALUES (?, ?, ?, ?, ?)`,tracking)
    // 4. Aggiornamento dello stato del letto per il nuovo paziente
    if (info && info.affectedRows > 0) {
      await conn.query(
        'UPDATE postiletto SET IDStatoLetto = 16, sessoPz = ? WHERE IDPostoletto = ?',
        [sesso, IDPostoLetto]
      );
    }
    
    // Conferma la transazione
    await conn.commit();
    conn.release();

    return res.status(200).json({
      success: true,
      message: 'Dati aggiornati con successo',
      updated: info.affectedRows
    });

  } catch (err) {
    // Gestione rollback in caso di errore
    if (conn) {
      await conn.rollback();
      conn.release();
    }
    
    console.error("Errore durante il salvataggio del paziente:", err);
    return res.status(500).json({ 
      success: false, 
      message: 'Errore interno del server durante il salvataggio',
      error: err.message 
    });
  }
});

router.get('/dimettiPaziente/:IDPaziente/:IDPostoLetto/:livelloAccesso/:IDUtente', async (req, res) => {
  let conn = null;
  try {
    const { IDPaziente, IDPostoLetto, livelloAccesso, IDUtente } = req.params;
    
    // Ottieni la connessione attendendo la promessa
    conn = await pool.getConnection();
    
    // Avvia la transazione
    await conn.beginTransaction();

    // Recupera il setting dell'utente (Usa la connessione della transazione, non il pool direttamente)
    const [rows] = await conn.query(`
      SELECT s.IDSetting FROM setting s
      JOIN utenti_setting us ON us.IDSetting = s.IDSetting
      JOIN utenti u ON u.IDUtente = us.IDUtente
      WHERE u.IDUtente = ?`, [IDUtente]);

    if (rows.length === 0) {
      throw new Error("Setting utente non trovato");
    }

    const oggi = new Date().toISOString().slice(0, 10); // Assicurati che 'oggi' sia definito

    // 1) Aggiorno il paziente
    const [infoPaziente] = await conn.query(
      `UPDATE paziente p SET p.dataDimissione = ?, IDProvenienza = ?, attivo = 0
       WHERE p.IDPaziente = ?`,
      [oggi, rows[0].IDSetting, IDPaziente]
    );

    // 2) Aggiorno il posto letto SOLO se l'update paziente ha avuto effetto
    if (infoPaziente.affectedRows > 0) {
      await conn.query(
        `UPDATE postiletto SET IDStatoLetto = 14 WHERE IDPostoLetto = ?`,
        [IDPostoLetto]
      );
    } else {
      throw new Error("Nessun paziente aggiornato. ID errato?");
    }

    // Conferma i cambiamenti
    await conn.commit();
    return res.json({ success: true });

  } catch (err) {
    // Se la transazione è avviata, esegui il rollback in caso di errore
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error("Errore durante il rollback:", rollbackErr);
      }
    }
    console.error(err);
    return res.status(500).json({ error: "Errore in aggiornamento" });
  } finally {
    // Rilascia SEMPRE la connessione al pool, sia in caso di successo che di errore
    if (conn) {
      conn.release();
    }
  }
});

router.get('/pazientiDimessi/:giorni/:IDUtente', async (req, res) => {
  const giorni = req.params.giorni;
  const IDUtente = req.params.IDUtente;
  try {

    const [rows] = await pool.query(
      `SELECT 
    CASE 
        WHEN p.sesso = 1 THEN 'Donne'
        WHEN p.sesso = 2 THEN 'Uomini'
    END AS sesso,
    COUNT(*) AS totale
    FROM paziente p
    JOIN  postiletto ps ON p.IDPostoLetto = ps.IDPostoLetto
    join utenti_setting us ON us.IDSetting= ps.IDSetting
    WHERE p.dataDimissione IS NOT NULL
      AND p.dataDimissione >= NOW() - INTERVAL ? DAY
      AND us.IDUtente=?
    GROUP BY p.sesso;
`,[giorni, IDUtente]);

    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json([{ numero: 0, setting: "Nessun letto libero" }]);
  }
});
router.get('/pazientiDimessiPerSetting/:IDUtente/:livelloAccesso',async (req,res) =>{
  const IDUtente =req.params.IDUtente;
  const livelloAcesso = req.params.livelloAccesso;
   let sql ="";
   let params=[];
   
  switch(true){
    case (livelloAcesso <50):
    sql=`
    SELECT 
    s.setting,
    p.*,
    pl.numeroLetto,
    pl.IDPostoLetto,
    s1.setting AS settingDestinazione,
    DATE_FORMAT(p.dataNascita, '%d/%m/%Y') AS dataNascita,
    DATE_FORMAT(p.dataDimissione, '%H:%i') AS ora
FROM paziente p
INNER JOIN postiletto pl 
    ON pl.IDPostoLetto = p.IDPostoLetto
INNER JOIN setting s 
    ON s.IDSetting = pl.IDSetting
INNER JOIN utenti_setting us 
    ON us.IDSetting = s.IDSetting
INNER JOIN utenti u 
    ON u.IDUtente = us.IDUtente
INNER JOIN setting s1 
    ON p.IDSettingDestinazione = s1.IDSetting
WHERE u.IDUtente = ?
  AND p.dataDimissione >= CURDATE()
  AND p.dataDimissione < CURDATE() + INTERVAL 1 DAY
ORDER BY p.dataDimissione;`;
    params=[IDUtente];
    break;
  case (livelloAcesso >=50):
    sql = `SELECT
    s.setting AS settingDestinazione,
    p.IDPaziente,
    p.IDPazienteProv,
    p.nomePaziente,
    p.cognomePaziente,
    p.dataNascita,
    p.dataDimissione,
    p.IDUtenteTrasf,
    pl.numeroLetto,
    pl.IDPostoLetto,
    CONCAT_WS(' ', u1.cognome, u1.nome) AS bedManager,
    DATE_FORMAT(p.dataNascita, '%d/%m/%Y') AS dataNascitaFormatted,
    DATE_FORMAT(p.dataDimissione, '%H:%i') AS ora
FROM paziente p
JOIN postiletto pl 
    ON pl.IDPostoLetto = p.IDPostoLetto
JOIN setting s 
    ON s.IDSetting = pl.IDSetting
JOIN utenti u1  
    ON u1.IDUtente = p.IDUtenteTrasf
WHERE p.attivo = 1
ORDER BY pl.numeroLetto;

`
    params=[];
  break;
  }
  
try{
  
  const [rows]= await pool.query(sql,params);
  if(rows){
    return res.json(rows);
  }
}catch(err){
  console.log(err);
  res.status(500).json({error:"errore ......"});
  
}
})

router.get('/getPazienti',async (req,res)=>{
  try{
    const sql=`SELECT 
    p.IDPaziente,
    p.nomePaziente,
    p.cognomePaziente,
    DATE_FORMAT(p.dataNascita, '%d/%m/%Y') AS dataNascita,
    l.numeroLetto,
    l.IDPostoLetto,
    s.setting,
    s.ordine
FROM paziente p
LEFT JOIN postiletto l 
    ON l.IDPostoLetto = p.IDPostoLetto
INNER JOIN setting s 
    ON s.IDSetting = l.IDSetting
WHERE p.dataDimissione IS NULL
ORDER BY s.ordine, p.cognomePaziente, p.nomePaziente;`;
    const [rows]= await pool.query(sql,[]);
    if(rows){
      res.json(rows);
    }

  }catch(err){
    res.status(500).json({error:"Impossibile aver tutti i pazienti in trasferimento"})
  }

});


router.get('/caricaZona', async (req, res) => {
  let newRows = [];
  try {
       const [rows] = await pool.query(
      ` SELECT a.IDAzienda,a.nomeAzienda FROM aziende a
ORDER BY a.IDAzienda, nomeAzienda `,[]
    );
    if(rows.length !== 0){
        newRows = rows.map(row => ({
          "testo": row.nomeAzienda, 
          "valore": row.IDAzienda
        }));    
        res.json(newRows);
    } else {
        
        res.json([]);
    }
  
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});
router.get('/getSettingDestinazione', async (req, res) => {
  let newRows = [];
  try {
       const [rows] = await pool.query(
      `SELECT 
    COUNT(pl.IDPostoLetto) AS 'LETTI_LIBERI', 
    z.zona AS 'zona',
    s.IDSetting,
    s.setting AS 'setting'
FROM zone z
INNER JOIN setting s ON s.IDZona = z.IDZona
INNER JOIN postiletto pl ON pl.IDSetting = s.IDSetting
WHERE s.ospedaliero = 0 
  AND pl.IDStatoLetto = 14 
  AND LOWER(s.setting) NOT LIKE 'boarding%' 
GROUP BY z.IDZona, z.zona, s.IDSetting, s.setting;
`,[]
    );
    if(rows.length !== 0){
        newRows = rows.map(row => ({
          "testo": row.setting, 
          "valore": row.IDSetting
        }));      
        res.json(newRows);
    } else {
        res.json([]);
    }
  
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.get('/zone/:IDAzienda', async (req, res) => {
  const IDAzienda = req.params.IDAzienda;

  const sql = `
    SELECT IDZona, zona
    FROM zone
    WHERE IDAzienda = ?
  `;

  try {
    const [rows] = await pool.execute(sql, [IDAzienda]);
    res.json(rows);
  } catch (err) {
    console.error("Errore query zone:", err);
    res.status(500).json({ error: 'impossibile scaricare le zone' });
  }
});
router.get('/getSetting', async (req, res) => {
  const sql = `
    SELECT  
    s.IDSetting,
    s.setting,
    s.numLettiChiusuraEstiva
    from setting s
    WHERE s.attivo =1`
 ;

  try {
    const [rows] = await pool.execute(sql, []);

    res.json(rows);
  } catch (err) {
    console.error("Errore query zone:", err);
    res.status(500).json({ error: 'impossibile scaricare le zone' });
  }
});

router.get("/getIDPostolettoProv/:IDPazienteProv",async(req,res)=>{
  const IDPazienteProv = req.params.IDPazienteProv;
  const sql =`
  select IDPostoLetto from paziente where IDPaziente = ?
   `;
   const [rows]= await pool.query(sql,[IDPazienteProv])
   
   if (rows.length >0){
    res.json(rows[0].IDPostoLetto);
   }

})

router.get('/aggiornaDataTrasf/:IDPaziente/:IDPostoLettoDestinazione/:IDUtente/:IDPostoLetto/:IDSettingDestinazione', async (req, res) => {
  
  const IDPostoLetto = req.params.IDPostoLetto;
  const IDSettingDestinazione = req.params.IDSettingDestinazione;
  const IDPostoLettoDestinazione = req.params.IDPostoLettoDestinazione;
  const IDPaziente = req.params.IDPaziente;  
  const IDUtente = req.params.IDUtente;
 
  try{
     const conn = await pool.getConnection();
       await conn.beginTransaction();

        // 1️⃣ SELECT paziente
        const [rows] = await conn.query(
            "SELECT * FROM paziente WHERE IDPaziente = ?",
            [IDPaziente]
        );        
        if (rows.length === 0) {
            throw new Error("Paziente non trovato");
        }

        const paziente = rows[0];

        // 2️⃣ UPDATE data trasferimento
        await conn.query(
            "UPDATE paziente SET dataTrasf = NOW() ,IDSettingDestinazione = ?, attivo=0, IDUtenteTrasf = ? WHERE IDPaziente = ?",
            [IDSettingDestinazione,IDUtente,IDPaziente]
        );
        // aggiorno il letto del boarding a  libero perchè ho trasferito il paziente
         await conn.query(
            "UPDATE postiletto SET IDStatoLetto = 14  WHERE IDPostoLetto= ?",
            [IDPostoLetto]
        );

        // creazione nuovo record paziente inserendo anche il setting di che aveva prima in caso voglia annullare
        //  il trasferimento
        
        await conn.query(
            `INSERT INTO paziente 
             (idRicovero,IDPostoLetto,IDPazienteProv,nomePaziente, cognomePaziente,dataNascita,sesso, IDSettingDestinazione, dataTrasf,
             problemiAperti, IDUtenteTrasf)
             VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              paziente.idRicovero,  
              IDPostoLettoDestinazione,
                paziente.IDPaziente,
                paziente.nomePaziente,
                paziente.cognomePaziente,
                paziente.dataNascita,
                paziente.sesso,
                null,
                oggi,
                paziente.problemiAperti,
                IDUtente
            ]
        );
        // setto a occupato il letto di destinazione perchè ho trasferito il paziente
          const sql_letto =`UPDATE postiletto p SET p.IDStatoLetto= 16
                    WHERE p.IDPostoLetto= ?`;
          await conn.query(sql_letto, [IDPostoLettoDestinazione]);
        // 4️⃣ COMMIT
        await conn.commit();
        conn.release();

        res.json({
            ok: true,
            msg: "Trasferimento completato con successo"
        });
  }catch(err){
    conn.rollback();
    conn.release();
    console.error("Errore nella transazione:", err);
    res.status(500).json({error:'Errore nella transazione'})
  }
})
router.get('/cancellaInserimento/:IDPaziente/:IDPostoLetto', async (req, res) => {

  const { IDPaziente, IDPostoLetto } = req.params;


  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // ❌ ERRORE: "delete * from" NON ESISTE IN MYSQL
    const sql_delete = "DELETE FROM paziente WHERE IDPaziente = ?";

    const sql_ripristinoLetto = `
      UPDATE postiletto 
      SET IDStatoLetto = 14 
      WHERE IDPostoLetto = ?
    `;

    await conn.query(sql_delete, [IDPaziente]);
    await conn.query(sql_ripristinoLetto, [IDPostoLetto]);

    await conn.commit();

    res.json({ message: "Paziente eliminato e letto ripristinato" });

  } catch (err) {
    console.error("Errore cancellazione inserimento:", err);

    if (conn) await conn.rollback();

    res.status(500).json({ error: "Errore server durante la cancellazione" });

  } finally {
    if (conn) conn.release();
  }
});

// questo IDPaziente è quello nuovo che deve essere cancellato
// il 
router.get('/annullaTasferimento/:IDPostoLetto/:IDPaziente/:IDUtente/:IDPazienteProv', async (req, res) => {
  const IDPostoLetto = req.params.IDPostoLetto; 
  const IDPaziente =req.params.IDPaziente;
  const IDUtente = req.params.IDUtente;
  const IDPazienteProv = req.params.IDPazienteProv;

 
  // cancello la tupla del paziente appena trasferito 
  const [IDPostolettoSetting]=await pool.query("SELECT p.IDPostoLetto from paziente p WHERE p.IDPaziente=?", [IDPaziente]);

  const sql_delete=`DELETE FROM paziente WHERE IDPaziente = ?`;
  const sql_letto_boarding =`UPDATE postiletto p SET p.IDStatoLetto= 16
                    WHERE p.= ?`;// devo mettere IDPostoLettoProv

  //e aggiorno il paziente precedente con la data di trasferimento a null e attivo a 1

  const sql = `UPDATE paziente p SET p.IDSettingDestinazione=?, p.IDUtenteTrasf=?, p.attivo=1, p.dataTrasf=? WHERE IDPaziente = ? `;
  const sql_update_letto_Boarding =`UPDATE postiletto p SET p.IDStatoLetto= 16
                    WHERE p.IDPostoLetto= ?`;
 
   const sql_letto_setting =`UPDATE postiletto p SET p.IDStatoLetto= 14
                    WHERE p.IDPostoLetto= ?`;
 
  try {const [result] = await pool.execute(sql, [
  null,          // Corrisponde a IDSettingDestinazione
  null,          // Corrisponde a IDUtenteTrasf
  null,          // Corrisponde a dataTrasf (NON usare la stringa vuota "")
  IDPazienteProv // Corrisponde a IDPaziente nel WHERE
]);
    
    
    const [result_letto_bording] = await pool.execute("SELECT p.IDPostoLetto from paziente p WHERE p.IDPaziente=?", [IDPazienteProv]);
    await pool.execute(sql_update_letto_Boarding, [result_letto_bording[0].IDPostoLetto]);    
    await pool.execute(sql_letto_setting, [IDPostolettoSetting[0].IDPostoLetto]);
    const [result_delete] = await pool.execute(sql_delete, [IDPaziente]);
    if (result) {
      res.json(result);
      return;
    }
  } catch (err) { 
    console.error("Errore query update:", err);
    res.status(500).json({ error: 'Impossibile eseguire l\'update' });
  } 
});

// API PER OTTENERE LA TABELLA CON TUTTI I PAZIENTI GESTITI SUDDIVISI PER ZONA, SETTING
   
router.get('/pazientiGestiti', async (req, res) => {
  const sql = `
    SELECT 
      p.IDPaziente,
      pl.IDPostoLetto,
      pl.numeroLetto,
      s.setting,
      z.zona,
      p.cognomePaziente,
      p.nomePaziente
    FROM paziente p
    INNER JOIN postiletto pl ON pl.IDPostoLetto = p.IDPostoLetto
    INNER JOIN setting s ON s.IDSetting = pl.IDSetting
    INNER JOIN zone z ON z.IDZona = s.IDZona
    WHERE s.IDSetting NOT IN (4, 7)
      AND p.attivo = 0
    ORDER BY p.cognomePaziente, p.nomePaziente
  `;

  try {
    const [rows] = await pool.query(sql);

    return res.json(rows);  // risponde sempre, anche se vuoto
  } catch (err) {
    console.error("Errore query per ottenere i pazienti gestiti:", err);
    return res.status(500).json({ error: "Errore server" });
  }
});
router.get('/getZone', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM zone WHERE attiva = 1 ORDER BY zona ASC');
    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

router.post('/salvaDatiLetto', async (req, res) => {
  const { IDPostoLetto, IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza, sessoPz} = req.body;
  const postiletto = [sessoPz,IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza, 1, IDPostoLetto];

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
    console.log("questo è il sesso del paziente  ", sessoPz);
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
/* router.post('/occupaLetto', async (req, res) => {
  const { IDPostoLibero, dataOcc } = req.body;
  console.log("Dati ricevuti per occupare il letto:", { IDPostoLibero, dataOcc });
  const sql = `UPDATE posti_letto_liberi SET dataOcc = ?, attivo = 0 WHERE idPostoLibero = ?`;
  try {
    const [result] = await pool.query(sql, [dataOcc, IDPostoLibero]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nessun letto trovato con l'ID specificato" });
    }
    res.json({ message: "Letto occupato con successo" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Errore nel aggiornare il letto" });
  }
}); */
export default router;

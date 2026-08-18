import express from 'express';
import path from 'path';
import pool from '../config/db.js';
import { isBefore, parseISO } from 'date-fns';
import { format } from "date-fns";
import { it, sq, zhCN } from "date-fns/locale";
const oggi = format(new Date(), "yyyy-MM-dd HH:mm:ss");

import { fileURLToPath } from 'url';



const router = express.Router();

// Ricrea __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HOME PAGE


router.get('/numeroLettiLiberi/:IDUtente/:livelloAccesso', async (req, res) => {
  try {
    const { IDUtente, livelloAccesso} = req.params;
    
   
    // 1) Aggiorno il paziente
    
    let rows=[];
    if(livelloAccesso >=50 ){
      [rows] = await pool.query(
      `SELECT COUNT(*) AS 'LETTI LIBERI' , s.setting AS 'SETTING' FROM postiletto p 
          JOIN setting s ON s.IDSetting =p.IDSetting
			 JOIN zone z ON z.IDZona=s.IDZona      
          WHERE p.IDStatoLetto=14 AND s.setting NOT LIKE ("BORDING%") AND s.ospedaliero=0
          GROUP BY p.IDSetting`,
      []
    );
  }else{
      [rows] = await pool.query(
        `SELECT COUNT(*) AS 'LETTI LIBERI' , s.setting AS 'SETTING' FROM postiletto p 
          JOIN setting s ON s.IDSetting =p.IDSetting
			 JOIN zone z ON z.IDZona=s.IDZona  
			 JOIN utenti_setting us ON us.IDSetting = s.IDSetting
          JOIN utenti u ON u.IDUtente = us.IDUtente    
          WHERE p.IDStatoLetto=14 AND s.setting NOT LIKE ("BORDING%") AND s.ospedaliero=0 AND u.IDUtente=?
          GROUP BY p.IDSetting`,
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
    const sql =`SELECT pl.IDPostoLetto, pl.numeroLetto FROM postiletto pl
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

// ZONE
router.get("/pazientiPerSetting/:IDSetting", async(req, res) => {
    const { IDSetting } = req.params;
    const sql = `
         SELECT 
            p.IDPaziente,
            p.nomePaziente,
            p.cognomePaziente,
            DATE_FORMAT(p.dataNascita, '%d/%m/%Y') AS dataNascita,
            l.numeroLetto,
            l.IDPostoLetto,
            s.setting
        FROM paziente p
        
        LEFT JOIN postiLetto l ON l.IDPostoLetto = p.IDPostoLetto
        INNER JOIN setting s ON s.IDSetting = l.IDSetting
        WHERE l.IDSetting = ?
          AND p.dataTrasf IS NULL
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
        WHERE ISNULL (p.dataTrasf) 
        GROUP BY zona, setting, numeroLetto
    `;
    
      const [rows]= await pool.query(sql, [])
        console.log("rows=>", rows);
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
  console.log("idZona ricevuto:", idZona);
  try {
    const [rows] = await pool.query(
      `SELECT distinct s.IDSetting, z.zona, s.setting
    FROM setting s
    INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
    INNER JOIN utenti u ON u.IDUtente = us.IDUtente
    INNER JOIN zone z ON z.IDZona = s.IDZona
    WHERE s.ospedaliero =1 and z.IDZona =? 
    order by z.IDZona desc` ,
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
    if(livelloAccesso>=50){
      sql=`SELECT *
    FROM setting s
    INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
    INNER JOIN utenti u ON u.IDUtente = us.IDUtente
    INNER JOIN zone z ON z.IDZona = s.IDZona    
    WHERE s.ospedaliero =0`;
    }
    else{
      sql=`SELECT *
    FROM setting s
    INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
    INNER JOIN utenti u ON u.IDUtente = us.IDUtente
    INNER JOIN zone z ON z.IDZona = s.IDZona
    WHERE u.IDUtente = ?  AND s.ospedaliero =0;`
    }
    const [rows] = await pool.query(`SELECT *
    FROM setting s
    INNER JOIN utenti_setting us ON us.IDSetting = s.IDSetting
    INNER JOIN utenti u ON u.IDUtente = us.IDUtente
    INNER JOIN zone z ON z.IDZona = s.IDZona
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
    p.IDSetting, p.IDPostoLetto, p.numeroLetto, p.IDStatoLetto, p.numeroStanza,
    paziente.IDPaziente, paziente.nomePaziente, paziente.cognomePaziente,
    paziente.dataNascita, paziente.sesso, paziente.dataTrasf,
    paziente.IDSettingDestinazione,paziente.dataTrasf
FROM postiLetto p
LEFT JOIN paziente  
    ON paziente.IDPostoLetto = p.IDPostoLetto
   AND (
        paziente.dataTrasf IS NULL
        OR paziente.dataTrasf = 0
        OR paziente.dataTrasf = '0000-00-00'
      )
WHERE p.IDSetting = ?
ORDER BY p.numeroStanza, p.numeroLetto
`,
      [IDSetting]
    );

    res.json(rows);
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});
// SALVATAGGIO LETTO
router.post('/salvaDatiPaziente/:livelloAccesso', async (req, res) => {
  const livelloAccesso = req.params.livelloAccesso;
  
  
  const { IDPostoLetto, nomePaziente,cognomePaziente, dataNascita, sesso, settingDestinazione, dataTrasf,problemiAperti, settingApp } = req.body;
  const nuovoPaziente = [IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso, null, settingDestinazione, problemiAperti, settingApp];
  try {
    /*  if (livelloAccesso < 10) {
      return res.status(403).json({ error: 'Accesso negato' });
    }else if(livelloAccesso >=50){
    nuovoPaziente[5] = null; 
    } */
    // prima di fare l'inserimento devo controllare nella tabella pazienti che non siano presenti pazienti in quel letto senza data di trasf.
    const [rowsPzPresente] = await pool.query(`SELECT * FROM paziente
                              WHERE paziente.IDPostoLetto= ? AND (
        paziente.dataTrasf IS NULL
        OR paziente.dataTrasf = 0
        OR paziente.dataTrasf = '0000-00-00'    
      );`, [IDPostoLetto]);
    
    if(rowsPzPresente.length >0){
      const [rows]= await pool.query('UPDATE paziente set dataTrasf=? where IDPostoLetto = ? and IDPaziente = ?',[oggi,IDPostoLetto,rowsPzPresente[0].IDPaziente])
      const [info]= await pool.query('UPDATE postiletto set IDStatoLetto=16 where IDPostoletto =?',[IDPostoLetto])
    }
    
    // SE abbiamo rowsPzPresente devo inserire la data di trasf. nella tupla toravata e eseguire l'inserimeto

    const [info] = await pool.query(`INSERT INTO paziente (IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso,dataTrasf,IDSettingDestinazione,problemiAperti,IDProvenienza)
      VALUES (?,?, ?,?,?,?,?,?,?)`, nuovoPaziente);
    if(info){
      const [info1]= await pool.query('UPDATE postiletto set IDStatoLetto=16 where IDPostoletto =?',[IDPostoLetto]);
    }
    
    res.json({
      message: 'Dati aggiornati con successo',
      updated: info.affectedRows
    });
  } catch (err) {
    console.error('Errore query:', err);
    res.status(500).json({ error: 'Errore server' });
  }

});
router.post('/salvaDatiLetto', async (req, res) => {
  const { IDPostoLetto, IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza } = req.body;
  const postiLetto = [IDSetting, IDStatoLetto, IDTipoLetto, numeroStanza, 1, IDPostoLetto];

  try {
    const [rows] = await pool.query(`SELECT * FROM paziente
                              WHERE paziente.IDPostoLetto= ? AND (
        paziente.dataTrasf IS NULL
        OR paziente.dataTrasf = 0
        OR paziente.dataTrasf = '0000-00-00'
      );`, [IDPostoLetto]);
      
   
    if (rows.length > 0) {
     console.log([oggi,IDSetting,IDSetting, rows[0].IDPaziente])
      const [info] = await pool.query(`UPDATE paziente p
       SET p.dataTrasf=NOW(),p.IDSettingDestinazione=?, IDProvenienza =?
       WHERE IDPaziente=?`, [IDSetting,IDSetting, rows[0].IDPaziente]);
    }

    const [info] = await pool.query(
      `UPDATE postiletto 
       SET IDSetting=?, IDStatoLetto=?, IDTipoLetto=?, numeroStanza=?, attivo=? 
       WHERE IDPostoLetto=?`,
      [...postiLetto]
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
router.get('/dimettiPaziente/:IDPaziente/:IDPostoLetto/:livelloAccesso', async (req, res) => {
  try {
    const { IDPaziente, IDPostoLetto,livelloAccesso } = req.params;
    

    // 1) Aggiorno il paziente
    const [infoPaziente] = await pool.query(
      `UPDATE paziente p SET p.dataTrasf= CURDATE()
          WHERE p.IDPaziente=?`,
      [IDPaziente]
    );

    // 2) Aggiorno il posto letto SOLO se l'update paziente ha avuto effetto
    if (infoPaziente.affectedRows > 0 ) {
      await pool.query(
        `UPDATE postiLetto SET IDStatoLetto = 14 WHERE IDPostoLetto = ?`,
        [IDPostoLetto]
)}

    // 3) Risposta al client
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore in aggiornamento" });
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
    WHERE p.dataTrasf IS NOT NULL
      AND p.dataTrasf >= NOW() - INTERVAL ? DAY
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
    DATE_FORMAT(p.dataTrasf, '%H:%i') AS ora
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
  AND DATE(p.dataTrasf) = CURDATE();`;
    params=[IDUtente];
    break;
  case (livelloAcesso >=50):
    sql = `SELECT 
    s.setting,
    p.*,
    pl.numeroLetto,
    pl.IDPostoLetto,
    s1.setting AS settingDestinazione,
    CONCAT_WS(' ', u1.cognome, u1.nome) AS "BED MANAGER",
    DATE_FORMAT(p.dataNascita, '%d/%m/%Y') AS dataNascita,
    DATE_FORMAT(p.dataTrasf, '%H:%i') AS ora
FROM paziente p
INNER JOIN postiletto pl 
    ON pl.IDPostoLetto = p.IDPostoLetto
INNER JOIN setting s 
    ON s.IDSetting = pl.IDSetting
INNER JOIN setting s1 
    ON p.IDSettingDestinazione = s1.IDSetting
INNER JOIN utenti u1 
    ON u1.IDUtente = p.IDUtenteTrasf
WHERE DATE(p.dataTrasf) = CURDATE();
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
        
        LEFT JOIN postiLetto l ON l.IDPostoLetto = p.IDPostoLetto
        INNER JOIN setting s ON s.IDSetting = l.IDSetting
        WHERE (
        p.dataTrasf IS NULL
        OR p.dataTrasf = 0
        OR p.dataTrasf = '0000-00-00'
      )
        ORDER BY s.ordine, p.cognomePaziente, p.nomePaziente `;
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
      `SELECT a.IDAzienda,a.nomeAzienda FROM aziende a
ORDER BY a.IDAzienda, nomeAzienda`,[]
    );
    /*SELECT a.IDAzienda, z.zona, a.nomeAzienda FROM aziende a
INNER JOIN aziende_zone az ON az.idAzienda= a.IDAzienda
INNER JOIN zone z ON z.IDZona =az.idZona
ORDER BY a.IDAzienda, nomeAzienda,zona*/
    if(rows.length !== 0){
        newRows = rows.map(row => ({
          "testo": row.zona, 
          "valore": row.IDZona
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
      `SELECT COUNT(s.IDSetting), z.zona,s.* FROM zone 
        INNER JOIN setting s ON s.IDZona= zone.IDZona
        INNER JOIN postiletto pl ON pl.IDSetting= s.IDSetting
        INNER JOIN zone z ON z.IDZona = s.IDZona
        WHERE s.ospedaliero =0 and pl.IDStatoLetto=14 AND s.setting NOT LIKE ("BORDING%")
        GROUP BY s.IDZona,s.setting, pl.IDStatoLetto`,[]
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

router.get('/annullaTasferimento/:IDPostoLetto/:IDPaziente/:IDUtente', async (req, res) => {
  const IDPostoLetto = req.params.IDPostoLetto;
  const IDPaziente =req.params.IDPaziente;
  const IDUtente = req.params.IDUtente;
  
  // Sostituisci 'nome_tabella' e 'nome_campo_data' con i tuoi dati reali
  // NOW() inserisce data e ora correnti (AAAA-MM-GG HH:MM:SS)
  const sql = `UPDATE paziente p SET p.dataTrasf=?, p.IDSettingDestinazione=?, p.IDUtenteTrasf=? WHERE IDPaziente = ? `;

  try {
    const [result] = await pool.execute(sql, ["",null,IDUtente,IDPaziente]);
  
    const [result1]= await pool.execute(sql_letto, [IDPostoLetto]);
    
    if (result) {
      res.json(result);
      return;
    }
  } catch (err) { 
    console.error("Errore query update:", err);
    res.status(500).json({ error: 'Impossibile eseguire l\'update' });
  } 
});
router.get('/aggiornaDataTrasf/:IDPaziente/:IDPostoLettoDestinazione/:IDUtente/:IDPostoLetto/:IDSettingDestinazione', async (req, res) => {
  console.log("letto destinazione=>", req.params.IDSettingDestinazione);
  const IDPostoLetto = req.params.IDPostoLetto;
  const IDSettingDestinazione = req.params.IDSettingDestinazione;
  const IDPaziente = req.params.IDPaziente;
  
  const IDUtente = req.params.IDUtente;
  const IDPostoLettoDestinazione = req.params.IDPostoLettoDestinazione;
  const conn = await pool.getConnection();
  try{
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
            "UPDATE paziente SET dataTrasf = NOW() ,IDSettingDestinazione = ?,IDUtenteTrasf = ? WHERE IDPaziente = ?",
            [IDSettingDestinazione,IDUtente,IDPaziente]
        );
         await conn.query(
            "UPDATE postiletto SET IDStatoLetto = 14  WHERE IDPostoLetto= ?",
            [IDPostoLetto]
        );

        // 3️⃣ INSERT nel nuovo setting
        await conn.query(
            `INSERT INTO paziente 
             (IDPostoLetto,nomePaziente, cognomePaziente,dataNascita,sesso, IDSettingDestinazione, dataTrasf,
             problemiAperti, IDUtenteTrasf)
             VALUES (?, ?, ?, ?, ?, ?, null, ?, ?)`,
            [
                IDPostoLettoDestinazione,
                paziente.nomePaziente,
                paziente.cognomePaziente,
                paziente.dataNascita,
                paziente.sesso,
                null,
                null,
                paziente.problemiAperti,
                IDUtente
            ]
        );
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
  
/*   // Sostituisci 'nome_tabella' e 'nome_campo_data' con i tuoi dati reali
  // NOW() inserisce data e ora correnti (AAAA-MM-GG HH:MM:SS)
  const sqlNuovPaziente =` insert into paziente (IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso,dataTrasf,IDSettingDestinazione,problemiAperti)
  values (?,?,?,?,?,?,?,?)
  `;
  const sql = `UPDATE paziente p SET p.dataTrasf=NOW(), p.IDSettingDestinazione=?, p.IDUtenteTrasf=? WHERE IDPaziente = ? `;
  const sql_letto =`UPDATE postiletto p SET p.IDStatoLetto= 14
                    WHERE p.IDPostoLetto= ?`;
  const sql_lettoDest =`
  UPDATE paziente p SET p.dataTrasf=NOW(), p.IDSettingDestinazione=?, p.IDUtenteTrasf=? WHERE IDPaziente = ? 
  `

  try {
    const [result] = await pool.execute(sql, [IDSettingDestinazione,IDUtente,IDPaziente]);
    const [result1]= await pool.execute(sql_letto, [IDPostoLetto]);
    
    if (result) {
      res.json(result);
      return;
    }
  } catch (err) { 
    console.error("Errore query update:", err);
    res.status(500).json({ error: 'Impossibile eseguire l\'update' });
  }  */
});

export default router;

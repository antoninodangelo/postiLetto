import express from 'express';
import path from 'path';
import pool  from '../config/db.js';
import { isBefore, parseISO } from 'date-fns';
import { format } from "date-fns";
import { it } from "date-fns/locale";
const oggi = format(new Date(), "yyyy-MM-dd", { locale: it });
import { fileURLToPath } from 'url';



const router = express.Router();

// Ricrea __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HOME PAGE
router.get('/', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/index.html'));
});
router.get('/setting', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/gestioneLettiSettingTer.html'))
})
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/logIn.html'))
})

router.get("/territorio", (req, res)=>{
   res.sendFile(path.join(__dirname, '../public/html/gestioneLettiSettingTer.html'));
})
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
    console.error('error:', err);
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

router.get('/settingUtente/:IDUtente', async (req, res) => {
  const IDUtente = req.params.IDUtente;
  try {
    const [rows] = await pool.query(`SELECT *
    FROM setting
    INNER JOIN utenti_setting us ON us.IDSetting = setting.IDSetting
    INNER JOIN utenti u ON u.IDUtente = us.IDUtente
    WHERE u.IDUtente = ?;`, [IDUtente]);
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
router.post('/salvaDatiPaziente', async (req, res) => {
  const { IDPostoLetto, nomePaziente,cognomePaziente, dataNascita, sesso, settingDestinazione, dataTrasf,problemiAperti } = req.body;
  const nuovoPaziente = [IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso, null, settingDestinazione, problemiAperti];
  try {
    
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

    const [info] = await pool.query(`INSERT INTO paziente (IDPostoLetto, nomePaziente, cognomePaziente, dataNascita, sesso,dataTrasf,IDSettingDestinazione,problemiAperti)
      VALUES (?,?, ?,?,?,?,?,?)`, nuovoPaziente);
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
      

    if (rows) {
      const [info] = await pool.query(`UPDATE paziente 
       SET dataTrasf=? 
       WHERE IDPostoLetto=?`, [oggi, IDPostoLetto]);
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
router.get('/eliminaPaziente/:IDPaziente/:IDPostoLetto/:livelloAccesso', async (req, res) => {
  try {
    const { IDPaziente, IDPostoLetto,livelloAccesso } = req.params;
    

    // 1) Aggiorno il paziente
    const [infoPaziente] = await pool.query(
      `delete from paziente WHERE IDPaziente= ?`,
      [IDPaziente]
    );

    // 2) Aggiorno il posto letto SOLO se l'update paziente ha avuto effetto
    if (infoPaziente.affectedRows > 0 && livelloAccesso< 50) {
      await pool.query(
        `UPDATE postiLetto SET IDStatoLetto =16 WHERE IDPostoLetto = ?`,
        [IDPostoLetto]
      );
    }else{
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
router.get('/numeroLettiLiberi/:IDUtente/:livelloAccesso', async (req, res) => {
  try {
    const { IDUtente, livelloAccesso} = req.params;
    
   
    // 1) Aggiorno il paziente
    
    let rows=[];
    if(livelloAccesso >=50 ){
      [rows] = await pool.query(
      `SELECT COUNT(*) AS 'LETTI LIBERI' , s.setting AS 'SETTING' FROM postiletto p 
          JOIN setting s ON s.IDSetting =p.IDSetting
          JOIN utenti_setting us ON us.IDSetting = s.IDSetting
          JOIN utenti u ON u.IDUtente = us.IDUtente 
          WHERE p.IDStatoLetto=14 AND s.IDSetting != 4
          GROUP BY p.IDSetting`,
      []
    );
  }else{
      [rows] = await pool.query(
        `SELECT COUNT(*) AS 'LETTI LIBERI' , s.setting AS 'SETTING' FROM postiletto p 
            JOIN setting s ON s.IDSetting =p.IDSetting
            JOIN utenti_setting us ON us.IDSetting = s.IDSetting
            JOIN utenti u ON u.IDUtente = us.IDUtente 
            WHERE p.IDStatoLetto=14 AND s.IDSetting != 4 AND u.IDUtente=?
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
router.get('/numeroLettiChiusi/:IDUtente/:livelloAccesso', async (req, res) => {
  try {
    const { IDUtente,livelloAccesso} = req.params;
    
    let rows=[];
   if(livelloAccesso >= 50){
      [rows] = await pool.query(
        `SELECT COUNT(*) AS 'LETTI CHIUSI' , s.setting AS 'SETTING' FROM postiletto p 
            JOIN setting s ON s.IDSetting =p.IDSetting
            JOIN utenti_setting us ON us.IDSetting = s.IDSetting
            JOIN utenti u ON u.IDUtente = us.IDUtente 
            WHERE p.IDStatoLetto=3 AND s.IDSetting != 4
            GROUP BY p.IDSetting`,
        []
      );
   }else{
      [rows] = await pool.query(
        `SELECT COUNT(*) AS 'LETTI CHIUSI' , s.setting AS 'SETTING' FROM postiletto p 
            JOIN setting s ON s.IDSetting =p.IDSetting
            JOIN utenti_setting us ON us.IDSetting = s.IDSetting
            JOIN utenti u ON u.IDUtente = us.IDUtente 
            WHERE p.IDStatoLetto=3 AND u.IDUtente=? AND s.IDSetting != 4
            GROUP BY p.IDSetting`,
        [IDUtente]
      );
   } 
    
    if(rows.length === 0){
      return res.json([{ numero: 0, setting: "Nessun letto chiuso" }]);
    } else {
      res.json(rows);
    }
    // 3) Risposta al client
    //  
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel ricecere id dati posti chiusi" });
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


router.get('/getSettingDestinazione', async (req, res) => {
  let newRows = [];
  try {
       const [rows] = await pool.query(
      `SELECT DISTINCT s.* FROM setting s
      inner JOIN postiletto p ON p.IDSetting = s.IDSetting 
      WHERE s.IDSetting !=4 AND p.IDStatoLetto=14`,[]
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
    z.zona,
    a.nomeAzienda,
    s.numLettiChiusuraEstiva
FROM setting s
inner join zone z ON s.IDZona= z.IDZona
INNER JOIN aziende_zone az ON az.idAziendaZona= s.IDAziendaZona
INNER JOIN aziende a ON a.IDAzienda = az.idAzienda`
 ;

  try {
    const [rows] = await pool.execute(sql, []);

    res.json(rows);
  } catch (err) {
    console.error("Errore query zone:", err);
    res.status(500).json({ error: 'impossibile scaricare le zone' });
  }
});
router.get('/getDatiDash/:IDSetting', async (req, res)=>{
  const IDSetting = req.params.IDSetting;
  const sql=`SELECT 
    COALESCE(COUNT(p.IDPostoLetto), 0) AS 'N°',
    sp.stato AS 'POSTI LETTO TOTALI',
    (
        SELECT COUNT(*) 
        FROM postiletto 
        WHERE IDSetting = ?
    ) AS 'POSTI TOTALI'
FROM stato_postiletto sp
LEFT JOIN postiletto p 
    ON p.IDStatoLetto = sp.IDStato
    AND p.IDSetting = ?
GROUP BY sp.IDStato, sp.stato;
`;
try {
    const [rows] = await pool.execute(sql, [IDSetting,IDSetting]);
    res.json(rows);
  } catch (err) {
    console.error("Errore query dash:", err);
    res.status(500).json({ error: 'impossibile scaricare le dash' });
  }

})
router.get('/annullaTasferimento/:IDPostoLetto/:IDPaziente/:IDUtente', async (req, res) => {
  const IDPostoLetto = req.params.IDPostoLetto;
  const IDPaziente =req.params.IDPaziente;
  const IDUtente = req.params.IDUtente;
  
  // Sostituisci 'nome_tabella' e 'nome_campo_data' con i tuoi dati reali
  // NOW() inserisce data e ora correnti (AAAA-MM-GG HH:MM:SS)
  const sql = `UPDATE paziente p SET p.dataTrasf=?, p.IDSettingDestinazione=?, p.IDUtenteTrasf=? WHERE IDPaziente = ? `;
/*   const sql_letto =`UPDATE postiletto p SET p.IDStatoLetto= 13
                    WHERE p.IDPostoLetto= ?`
 */
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
router.get('/aggiornaDataTrasf/:IDPaziente/:IDSettingDestinazione/:IDUtente/:IDPostoLetto', async (req, res) => {
  const IDPostoLetto = req.params.IDPostoLetto;
  const IDPaziente = req.params.IDPaziente;
  const IDSettingDestinazione = req.params.IDSettingDestinazione;
  const IDUtente = req.params.IDUtente;
  
  // Sostituisci 'nome_tabella' e 'nome_campo_data' con i tuoi dati reali
  // NOW() inserisce data e ora correnti (AAAA-MM-GG HH:MM:SS)
  
  const sql = `UPDATE paziente p SET p.dataTrasf=NOW(), p.IDSettingDestinazione=?, p.IDUtenteTrasf=? WHERE IDPaziente = ? `;
  const sql_letto =`UPDATE postiletto p SET p.IDStatoLetto= 14
                    WHERE p.IDPostoLetto= ?`

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
  } 
});
router.get('/aggiuntaBoarding/:IDSetting', async (req, res) => {
  const IDSetting = req.params.IDSetting;

  const sql = `
    SELECT *
    FROM postiletto p
    WHERE p.IDSetting = ?
    ORDER BY p.numeroLetto desc
    LIMIT 1
  `;
  const sqlIns=`INSERT INTO postiletto (IDSetting, numeroLetto, IDStatoLetto, attivo) VALUES (
  ?, ?, 14, 1);
  `;

  try {
    const [datiLetto] = await pool.query(sql, [IDSetting]);

    if (datiLetto.length === 0) {
      return res.status(404).json({ error: "Nessun letto disponibile per questo setting" });
    }
    const numeroLetto = datiLetto[0]['numeroLetto']+1
    const[result]= await pool.execute(sqlIns,[IDSetting,numeroLetto])
   
    return res.json(result);   // 🔥 RESTITUISCE IL LETTO AL CLIENT

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Impossibile identificare il letto" });
  }
});

router.get("/sottraiBoarding/:idSetting", async (req, res) => {
    const IDSetting = req.params.idSetting;

    try {
        const sql = `
            SELECT *
            FROM postiletto
            WHERE IDSetting = ? AND IDStatoLetto = 14
            ORDER BY numeroLetto DESC
            LIMIT 1;

            SELECT COUNT(*) AS conteggio
            FROM postiletto
            WHERE IDSetting = ?;
        `;

        const [rows] = await pool.query(sql, [IDSetting, IDSetting]);

        const ultimoLetto = rows?.[0]?.[0] ?? null;
        const totale = rows?.[1]?.[0]?.conteggio ?? 0;

        console.log("Totale letti:", totale);

        if (!ultimoLetto) {
            return res.json({ error: "Nessun letto disponibile da cancellare" });
        }

        if (totale === 1) {
            return res.json({ error: "Non puoi cancellare l'ultimo letto" });
        }
       
        await pool.query(
            `DELETE FROM postiletto WHERE IDPostoLetto = ?`,
            [ultimoLetto.IDPostoLetto]
        );

        res.json({ ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

/// INIZIO API PER GESTIONE PIANO 
router.get('/getStoricoChiusure',async(req,res)=>{

  const sql=`SELECT s.*,setting.setting FROM storico_chiusure_estive s
INNER JOIN setting ON setting.IDSetting= s.IDSetting`;
try {
    const [rows] = await pool.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error("Errore query:", err);
    res.status(500).json({ error: 'impossibile scaricare le chiusure' });
  }
})

router.get('/getDettaglioStoricoChiusure',async(req,res)=>{

  const sql=`SELECT * FROM dettaglio_chiusure`;
try {
    const [rows] = await pool.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error("Errore query:", err);
    res.status(500).json({ error: 'impossibile scaricare le chiusure' });
  }
})

//// fine api per getionePaino
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login'); // oppure JSON se è un'API
}



router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

export default router;

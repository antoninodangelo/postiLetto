
async function gestisciChiusure(containerID) {
   
    try {
        const reparti = await fetch('/getSetting');
        if (!reparti.ok) {
            throw new Error("Errore nella risposta del server");
        }
creaCardConBottone("dashboardReparti", "INSERISCI UN NUOVO PIANO");
        const datiReparti = await reparti.json();
        const datiRaggruppati = raggruppaPerSetting(datiReparti);
        
        for(const[chiave, valore] of Object.entries(datiRaggruppati)){
           
            creaCardConTabella("dashboardReparti",chiave, valore);
        }
       
    } catch (err) {
        console.error("Errore:", err);
        return { error: err.message };
    }
}
function creaCardConTabella(containerId,key,value) {
    const chiave = value.IDSetting;
    const valore = value.setting;
    const numLettiChiusuraEstiva = value.numLettiChiusuraEstiva;
    //const numLettiChiusi = value.numLettiChiusuraEstiva;
    console.log(value)
    const container = document.getElementById(containerId);
    if (!container) return;

    // CARD
    const card = document.createElement("div");
    card.className = "card shadow-sm mb-4";

    // HEADER
    const header = document.createElement("div");
    header.className = "card-header bg-primary text-white";    
    header.innerHTML = `
    <div class="titolo-reparto d-flex justify-content-between align-items-center">
        <span class="nome-reparto">${valore}</span>

        <span class="badge bg-warning text-dark badge-letti">
            ${numLettiChiusuraEstiva} letti in chiusura estiva
        </span>
    </div>
`;




    // BODY
    const body = document.createElement("div");
    body.className = "card-body";

    // TABELLA
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered align-middle";

    // THEAD
    const thead = document.createElement("thead");
    thead.className = "table";

    const headerRow = document.createElement("tr");
    const colonne = ["N° Posti Letto chiusi", "Inizio Chiusura", "Fine Chiusura"];

    colonne.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // TBODY
    const tbody = document.createElement("tbody");

    

    value.dettagli.forEach(p => {
        const tr = document.createElement("tr");

        ['numPostiChiusiFerie','dataInizio','dataFine'].forEach(key => {
            const td = document.createElement("td");
            td.textContent = p[key];
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // ASSEMBLA CARD
    body.appendChild(table);
    card.appendChild(header);
    card.appendChild(body);

    // APPEND
   // container.innerHTML = "";
    container.appendChild(card);
}
 
function raggruppaPerSetting(risultatiQuery) {
    const mappa = {};

    for (const riga of risultatiQuery) {

        const id = riga.IDSetting;

        // Se non esiste ancora il gruppo, lo creo
        if (!mappa[id]) {
            mappa[id] = {
                IDSetting: riga.IDSetting,
                setting: riga.setting,
                numLettiChiusuraEstiva: riga.numLettiChiusuraEstiva,
                totaleLettiChiusi: riga.totaleLettiChiusi ?? 0,
                dettagli: []
            };
        }

        // Aggiungo il dettaglio della chiusura
        mappa[id].dettagli.push({
            numPostiChiusiFerie: riga.numPostiChiusiFerie ?? 0,
            dataInizio: riga.dataInizioChiusura || null,
            dataFine: riga.dataFineChiusura || null
        });
    }

    // Converto la mappa in array
    return Object.values(mappa);
}
function creaCardConBottone(containerId, titolo) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // CARD
    const card = document.createElement("div");
    card.className = "card shadow-sm mb-3";

    // HEADER
    const header = document.createElement("div");
    header.className = "card-header bg-primary text-white d-flex justify-content-between align-items-center";

    const hTitle = document.createElement("span");
    hTitle.textContent = titolo;

    const btn = document.createElement("button");
    btn.className = "btn btn-warning btn-sm nuovoPiano";
    btn.textContent = "Inserisci un nuovo piano";

    header.appendChild(hTitle);
    

    // BODY
    const body = document.createElement("div");
    body.className = "card-body";
    body.appendChild(btn);

    // ASSEMBLA
    card.appendChild(header);
    card.appendChild(body);

    // APPEND
    container.appendChild(card);
}
document.addEventListener('click',(e)=>{
    if(e.target.classList.contains('nuovoPiano')){
        alert('hai cliccato');
    }
})
export {gestisciChiusure};
/**
 * Crea una tabella Bootstrap con 5 colonne e la inserisce nel contenitore indicato.
 * @param {string} containerId - ID del div dove appendere la tabella
 * @param {Array} data - Array di oggetti con i dati dei pazienti
 * @param {integer} IDSetting - ID del setting da visualizzare 
 */
async function tabellaDimissioni(containerId, IDUtente,livelloAccesso) {
  console.log(containerId, IDUtente,livelloAccesso);
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML="";
    const datiDimessi = await fetch(`/pazientiDimessiPerSetting/${IDUtente}/${livelloAccesso}`);
    const data = await datiDimessi.json();
    
if(data.length === 0 ) return;

  // Crea la tabella
  const table = document.createElement("table");
  table.className = "table table-striped table-bordered align-middle";

  // ----- THEAD -----
  const thead = document.createElement("thead");
  thead.className = "table-dark";

  const headerRow = document.createElement("tr");
  const headers = ["setting","Nome", "Cognome", "Data di nascita","sesso", "Numero letto","ORA ASS. SETTING","BED MANAGER"];
  
  if(livelloAccesso>10)headers.push("ANNULLA");
    const tr1= document.createElement("tr");
  tr1.classList.add("text-center", "fw-bold");
const th1 =document.createElement("th");     
    th1.colSpan=headers.length;
    th1.innerText="PAZIENTI A CUI E' STATO ASSEGNATO IL REPARTO DI DESTiNAZIONE";
    tr1.appendChild(th1);
    thead.appendChild(tr1);
  headers.forEach(text => {
   
    const th = document.createElement("th");
    th.textContent = text;   
    
    headerRow.appendChild(th);

  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // ----- TBODY -----
  const tbody = document.createElement("tbody");

  data.forEach(p => {
    const tr = document.createElement("tr");

    // Celle dati
    ["setting", "nomePaziente", "cognomePaziente", "dataNascita","sesso","numeroLetto","ora","BED MANAGER"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = p[key];
      tr.appendChild(td);
    });
   
console.log(livelloAccesso,"questo è il livello");
if(livelloAccesso > 10){
   const trAnnulla = document.createElement('td');
    const b_annulla_trasf = document.createElement('button');
      b_annulla_trasf.classList.add(
  "btn",
  "btn-outline-danger",
  "btn-sm",
  "d-flex",
  "align-items-center",
  "gap-1"
);
  b_annulla_trasf.dataset.IDPaziente = p.IDPaziente;
  b_annulla_trasf.dataset.IDPostoLetto = p.IDPostoLetto;
  b_annulla_trasf.innerHTML = `<i class="bi bi-x-circle"></i> Annulla trasf.`;
  b_annulla_trasf.addEventListener('click',async (e)=> 
    {
        await fetch(`/annullaTasferimento/${b_annulla_trasf.dataset.IDPostoletto}/${p.IDPaziente}/${IDUtente}`);
        tabellaDimissioni(containerId, IDUtente,livelloAccesso)
        
    })

    tr.appendChild(b_annulla_trasf);
}

    

   tbody.appendChild(tr)
  });

  table.appendChild(tbody);

  // Append finale
  container.innerHTML = ""; // pulizia
  container.appendChild(table);
}

export {tabellaDimissioni}
/**
 * Crea una tabella Bootstrap con 5 colonne e la inserisce nel contenitore indicato.
 * @param {string} containerId - ID del div dove appendere la tabella
 * @param {Array} data - Array di oggetti con i dati dei pazienti
 * @param {integer} IDSetting - ID del setting da visualizzare 
 */
async function tabellaRicoverati(containerId,livelloAccesso) {
  console.log(containerId,livelloAccesso);
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML="";
    const datiRicoverati = await fetch(`/territorio/pazientiRicoverati`);
    const data = await datiRicoverati.json();
    console.log("datiRicoverati=>", data);
    
if(data.length === 0 ) return;

  // Crea la tabella
  const table = document.createElement("table");
  table.className = "table table-striped table-bordered align-middle";

  // ----- THEAD -----
  const thead = document.createElement("thead");
  thead.className = "table-dark";

  const headerRow = document.createElement("tr");
  const headers = ["IDPaziente","zona", "setting", "nome","Numero letto"];
  
const tr1 = document.createElement("tr");
  const th1 =document.createElement("th");     
    th1.colSpan=headers.length;
    th1.innerText="Pazienti ricoverati";
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
    ["IDPaziente", "zona", "setting", "nome","numeroLetto"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = p[key];
      tr.appendChild(td);
    });  

   tbody.appendChild(tr)
  });

  table.appendChild(tbody);

  // Append finale
  container.innerHTML = ""; // pulizia
  container.appendChild(table);
}

export {tabellaRicoverati}
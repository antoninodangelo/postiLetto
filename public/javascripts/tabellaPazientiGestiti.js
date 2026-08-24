async function tabellaPazientiGestiti(containerId, IDUtente, livelloAccesso) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    
    const headers = [
        "NUMERO LETTO",
        "SETTING",
        "ZONA",
        "COGNOME",
        "NOME"
    ];
    
    const campi = [
        "numeroLetto",
        "setting",
        "zona",
        "cognomePaziente",
        "nomePaziente"
    ];

    // --- FETCH DATI ---
    const res = await fetch(`/territorio/pazientiGestiti`);
    if (!res.ok) {
        console.error("Errore nel recupero dei pazienti gestiti");
        return;
    }
    
    const data = await res.json();

    // --- CASO 1: NESSUN DATO TROVATO ---
   if (!Array.isArray(data) || data.length === 0) {
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered align-middle w-100";
    const thead = document.createElement("thead");
    thead.className = "table-dark";

    // 1. Prima Riga: Titolo Superiore
    const trTitle = document.createElement("tr");
    trTitle.classList.add("text-center", "fw-bold");
    
    const thTitle = document.createElement("th");
    thTitle.colSpan = headers.length; 
    thTitle.innerHTML = `<h3 class="m-0">NESSUN PAZIENTE TROVATO</h3>`;
    trTitle.appendChild(thTitle);
    thead.appendChild(trTitle);

    // 2. Seconda Riga: Filtri / Intestazioni
    
    table.appendChild(thead);
    container.appendChild(table);
    return;
}


    // --- CASO 2: TABELLA CON DATI ---
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered align-middle w-100";

    const thead = document.createElement("thead");
    thead.className = "table-dark";

    // 1. Prima Riga: Titolo superiore + Icona Excel
    const trTitle = document.createElement("tr");
    trTitle.classList.add("text-center", "fw-bold");

    const thTitle = document.createElement("th");
    thTitle.colSpan = headers.length; 

    thTitle.innerHTML = `
        <div class="d-flex align-items-center justify-content-center">
            <span class="fs-5">PAZIENTI GESTITI (NON BOARDING)</span>
            <img id="exportExcelPG" 
                 src="https://cdn-icons-png.flaticon.com/512/732/732220.png" 
                 alt="Excel" 
                 style="width:22px; margin-left:10px; cursor:pointer;">
        </div>
    `;

    trTitle.appendChild(thTitle);
    thead.appendChild(trTitle);
const trFiltro = document.createElement('tr');
    trFiltro.classList.add("text-center", "fw-bold");
    
    headers.forEach(key => {
        const thFiltro = document.createElement('th');
        // CORREZIONE: Il tag <i> deve essere VUOTO. Spostiamo eventuali testi all'esterno.
        thFiltro.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16" data-key="${key}">
  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"/>
 </svg>           
        `;
        trFiltro.appendChild(thFiltro);
    });        
    
    thead.appendChild(trFiltro);
    // 2. Seconda Riga: Intestazioni colonne
    const headerRow = document.createElement("tr");
    headerRow.classList.add("text-center");

    headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // --- TBODY ---
    const tbody = document.createElement("tbody");

    data.forEach(p => {
        const tr = document.createElement("tr");
        
        campi.forEach(key => {
            const td = document.createElement("td");
            td.textContent = p[key] || "-"; // Mostra un trattino se il campo è vuoto/null
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // --- APPEND FINALE E ASSEGNAZIONE EVENTI ---
    container.innerHTML = "";
    container.appendChild(table);

    // Attiva il listener solo se l'elemento Excel è stato effettivamente iniettato a schermo
    const btnExcel = document.getElementById("exportExcelPG");
    if (btnExcel) {
        btnExcel.addEventListener("click", () => {
            // 1) Prepara array di oggetti per SheetJS
            const excelData = data.map(p => ({
                "Numero Letto": p.numeroLetto,
                "Setting": p.setting,
                "Zona": p.zona,
                "Cognome": p.cognomePaziente,
                "Nome": p.nomePaziente
            }));
        
            // 2) Crea il foglio
            const ws = XLSX.utils.json_to_sheet(excelData);
        
            // 3) Crea la cartella di lavoro
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Pazienti Gestiti");
        
            // 4) Salva il file
            XLSX.writeFile(wb, "pazienti_gestiti.xlsx");
        });
    }
}

export { tabellaPazientiGestiti };

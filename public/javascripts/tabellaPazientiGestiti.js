async function tabellaPazientiGestiti(containerId, IDUtente, livelloAccesso) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    // --- FETCH DATI ---
    const res = await fetch(`/territorio/pazientiGestiti`);
    if (!res.ok) {
        console.error("Errore nel recupero dei pazienti gestiti");
        return;
    }
    
    const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
         const table = document.createElement("table");
        table.className = "table table-striped table-bordered align-middle";

        // --- THEAD ---
        // --- THEAD ---
        const thead = document.createElement("thead");
        thead.className = "table-dark";

        // Titolo superiore
        const trTitle = document.createElement("tr");
        trTitle.classList.add("text-center", "fw-bold");

        const thTitle = document.createElement("th");
        thTitle.colSpan = livelloAccesso > 10 ? 6 : 5;

        thTitle.innerHTML = `<h3>NESSUN PAZIENTE TROVATO</h3>`;

        trTitle.appendChild(thTitle);
        thead.appendChild(trTitle);
        table.appendChild(thead);
        container.appendChild(table);
        return;
    }

    // --- CREA TABELLA ---
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered align-middle";

    // --- THEAD ---
   // --- THEAD ---
const thead = document.createElement("thead");
thead.className = "table-dark";

// Titolo superiore
const trTitle = document.createElement("tr");
trTitle.classList.add("text-center", "fw-bold");

const thTitle = document.createElement("th");
thTitle.colSpan = livelloAccesso > 10 ? 6 : 5;

thTitle.innerHTML = `
    PAZIENTI GESTITI (NON BOARDING)
    <img id="exportExcelPG" 
         src="https://cdn-icons-png.flaticon.com/512/732/732220.png" 
         alt="Excel" 
         style="width:22px; margin-left:10px; cursor:pointer;">
`;

trTitle.appendChild(thTitle);
thead.appendChild(trTitle);


    // Intestazioni colonne
    const headerRow = document.createElement("tr");
    const headers = [
        "NUMERO LETTO",
        "SETTING",
        "ZONA",
        "COGNOME",
        "NOME"
    ];

    

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

        // Celle dati coerenti con la query SQL
        const campi = [
            "numeroLetto",
            "setting",
            "zona",
            "cognomePaziente",
            "nomePaziente"
        ];
        console.log(data,"dalkfshkdsahfkah");
        campi.forEach(key => {
            const td = document.createElement("td");
            td.textContent = p[key];
            tr.appendChild(td);
        });

       
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // --- APPEND FINALE ---
    container.innerHTML = "";
    container.appendChild(table);
    document.getElementById("exportExcelPG").addEventListener("click", () => {
    
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
// --- EXPORT EXCEL ---


export { tabellaPazientiGestiti };

let dati = null;

const instastazioni = [
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

// Stato ordinamento
const statoOrdinamento = {
    criterioCorrente: null,
    direzione: "DESC"
};

// Strategie di ordinamento con ASC/DESC
const strategieOrdinamento = {
    numero: (array, prop, dir) =>
        array.toSorted((a, b) =>
            dir === "ASC"
                ? a[prop] - b[prop]
                : b[prop] - a[prop]
        ),

    testo: (array, prop, dir) =>
        array.toSorted((a, b) =>
            dir === "ASC"
                ? a[prop].localeCompare(b[prop])
                : b[prop].localeCompare(a[prop])
        )
};

// Funzione principale
async function tabellaPazientiGestiti(containerId, IDUtente, livelloAccesso, datiOrdinati = null) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    // Recupero dati se non ordinati
    if (datiOrdinati === null) {
        const res = await fetch(`/territorio/pazientiGestiti`);
        if (!res.ok) {
            console.error("Errore nel recupero dei pazienti gestiti");
            return;
        }
        dati = await res.json();
    } else {
        dati = datiOrdinati;
    }

    // Nessun dato
    if (!Array.isArray(dati) || dati.length === 0) {
        const table = document.createElement("table");
        table.className = "table table-striped table-bordered align-middle w-100";

        const thead = document.createElement("thead");
        thead.className = "table-dark";

        const trTitle = document.createElement("tr");
        trTitle.classList.add("text-center", "fw-bold");

        const thTitle = document.createElement("th");
        thTitle.colSpan = instastazioni.length;
        thTitle.innerHTML = `<h3 class="m-0">NESSUN PAZIENTE TROVATO</h3>`;

        trTitle.appendChild(thTitle);
        thead.appendChild(trTitle);

        table.appendChild(thead);
        container.appendChild(table);
        return;
    }

    // Tabella con dati
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered align-middle w-100";

    const thead = document.createElement("thead");
    thead.className = "table-dark";

    // Titolo + Excel
    const trTitle = document.createElement("tr");
    trTitle.classList.add("text-center", "fw-bold");

    const thTitle = document.createElement("th");
   
    thTitle.colSpan = instastazioni.length;
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

    // Filtro / icone ordinamento
    const trFiltro = document.createElement("tr");
    trFiltro.classList.add("text-center", "fw-bold");

    campi.forEach(key => {
        const thFiltro = document.createElement("th");
         thFiltro.classList.add('filtro');
        thFiltro.dataset.key=key;
        thFiltro.innerHTML = `
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            fill="currentColor" class="bi bi-funnel pointer"
            viewBox="0 0 16 16" data-key="${key}" style="pointer-events: all;">
            <rect width="16" height="16" fill="transparent"></rect>
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z"/>
            </svg>

        `;
        trFiltro.appendChild(thFiltro);
    });

    thead.appendChild(trFiltro);

    // Intestazioni
    const headerRow = document.createElement("tr");
    headerRow.classList.add("text-center");

    instastazioni.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corpo tabella
    const tbody = document.createElement("tbody");

    dati.forEach(p => {
        const tr = document.createElement("tr");

        campi.forEach(key => {
            const td = document.createElement("td");
            td.textContent = p[key] || "-";
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    container.innerHTML = "";
    container.appendChild(table);

    // Esportazione Excel
    const btnExcel = document.getElementById("exportExcelPG");
    if (btnExcel) {
        btnExcel.addEventListener("click", () => {
            const excelData = dati.map(p => ({
                "Numero Letto": p.numeroLetto,
                "Setting": p.setting,
                "Zona": p.zona,
                "Cognome": p.cognomePaziente,
                "Nome": p.nomePaziente
            }));

            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Pazienti Gestiti");
            XLSX.writeFile(wb, "pazienti_gestiti.xlsx");
        });
    }
}

// Listener ordinamento
document.addEventListener("click", e => {
    const th = e.target.closest('.filtro');
    if (!th) return;
  const criterio = th.dataset.key;
    if (!campi.includes(criterio)) {
        console.warn(`Criterio "${criterio}" non autorizzato.`);
        return;
    }

    // Gestione direzione
    if (statoOrdinamento.criterioCorrente === criterio) {
        statoOrdinamento.direzione =
            statoOrdinamento.direzione === "ASC" ? "DESC" : "ASC";
    } else {
        statoOrdinamento.criterioCorrente = criterio;
        statoOrdinamento.direzione = "ASC";
    }

    // Determina tipo campo
    const tipoOrdinamento =
        ["cognomePaziente", "nomePaziente", "setting", "zona"].includes(criterio)
            ? "testo"
            : "numero";

    // Ordina
    const datiOrdinati = strategieOrdinamento[tipoOrdinamento](
        dati,
        criterio,
        statoOrdinamento.direzione
    );
    console.log(datiOrdinati);

    tabellaPazientiGestiti("dashboardReparti", 0, 50, datiOrdinati);
});

export { tabellaPazientiGestiti };

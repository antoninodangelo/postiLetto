async function tabellaDimissioni(containerId, IDUtente, livelloAccesso, generaTabellaPostiLiberi, generaTabellaPazienti, settingUtente) {

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    // --- FETCH DATI ---
    const res = await fetch(`/pazientiDimessiPerSetting/${IDUtente}/${livelloAccesso}`);
    if (!res.ok) {
        console.error("Errore nel recupero dei pazienti dimessi");
        return;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
        return; // nessun dimesso → nessuna tabella
    }

    // --- CREA TABELLA ---
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered align-middle";

    // --- THEAD ---
    const thead = document.createElement("thead");
    thead.className = "table-dark";

    // Titolo superiore
    const trTitle = document.createElement("tr");
    trTitle.classList.add("text-center", "fw-bold");

    const thTitle = document.createElement("th");
    thTitle.colSpan = livelloAccesso > 10 ? 9 : 8;
    thTitle.textContent = "PAZIENTI A CUI È STATO ASSEGNATO IL REPARTO DI DESTINAZIONE";
    trTitle.appendChild(thTitle);
    thead.appendChild(trTitle);
    

    // Intestazioni colonne
    const headerRow = document.createElement("tr");
    const headers = [
        "setting",
        "Nome",
        "Cognome",
        "Data di nascita",
        "sesso",
        "Numero letto",
        "ORA ASS. SETTING",
        "BED MANAGER"
    ];

    if (livelloAccesso > 10) headers.push("ANNULLA");

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

        // Celle dati
        const campi = [
            "setting",
            "nomePaziente",
            "cognomePaziente",
            "dataNascita",
            "sesso",
            "numeroLetto",
            "ora",
            "BED MANAGER"
        ];

        campi.forEach(key => {
            const td = document.createElement("td");
            td.textContent = p[key];
            tr.appendChild(td);
        });

        // --- BOTTONE ANNULLA TRASFERIMENTO ---
        if (livelloAccesso > 10) {

            const tdBtn = document.createElement("td");

            const b_annulla_trasf = document.createElement("button");
            b_annulla_trasf.classList.add(
                "btn",
                "btn-outline-danger",
                "btn-sm",
                "d-flex",
                "align-items-center",
                "gap-1"
            );

            // dataset corretti
            b_annulla_trasf.dataset.idPaziente = p.IDPaziente;
            b_annulla_trasf.dataset.idPazienteProv = p.IDPazienteProv;

            b_annulla_trasf.innerHTML = `<i class="bi bi-x-circle"></i> Annulla trasf.`;

            b_annulla_trasf.addEventListener("click", async () => {

                // 1) Recupero ID letto provvisorio
                const resLetto = await fetch(`/territorio/getIDPostolettoProv/${p.IDPazienteProv}`);
                const lettoProv = await resLetto.json();

                console.log("Letto provvisorio:", lettoProv);

                // 2) Annulla trasferimento
                await fetch(`/territorio/annullaTasferimento/${lettoProv}/${p.IDPaziente}/${IDUtente}/${p.IDPazienteProv}`);

                // 3) Refresh tabelle
                document.getElementById("tabellaTrasf").innerHTML = "";
                generaTabellaPostiLiberi(IDUtente, "tabellaTrasf", livelloAccesso);
                generaTabellaPazienti(settingUtente, "tabellaTrasf", livelloAccesso);               
                tabellaDimissioni(containerId, IDUtente, livelloAccesso, generaTabellaPostiLiberi, generaTabellaPazienti, settingUtente);
            });

            tdBtn.appendChild(b_annulla_trasf);
            tr.appendChild(tdBtn);
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // --- APPEND FINALE ---
    container.innerHTML = "";
    container.appendChild(table);
}

export { tabellaDimissioni };

async function tabellaDimissioni(containerId, IDUtente, livelloAccesso, generaTabellaPostiLiberi, caricaSetting, settings,generaTabellaPazienti) {
    const container = document.getElementById(containerId)    
    if (!container) return;
 
    container.innerHTML = "";
    
    // --- FETCH DATI ---
    const res = await fetch(`/territorio/pazientiDimessiPerSetting/${IDUtente}/${livelloAccesso}`);
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
        "DIMETTI"
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
            "ora"
        ];

        campi.forEach(key => {
            const td = document.createElement("td");
            td.textContent = p[key];
            tr.appendChild(td);
        });

        // --- BOTTONE ANNULLA TRASFERIMENTO ---
        if (livelloAccesso >= 50) {

            const tdBtn = document.createElement("td");
            const tdBtnDimetti = document.createElement("td");

            const b_annulla_trasf = document.createElement("button");
            b_annulla_trasf.classList.add(
                "btn",
                "btn-outline-danger",
                "btn-sm",
                "d-flex",
                "align-items-center",
                "gap-1"
            );
            const b_dimetti= document.createElement('button');
            b_dimetti.classList.add("btn",
                "btn-outline-danger",
                "btn-sm",
                "d-flex",
                "align-items-center",
                "gap-1");
            
            // dataset corretti
            b_dimetti.dataset.idPaziente=p.IDPaziente;
            b_annulla_trasf.dataset.idPaziente = p.IDPaziente;
            b_annulla_trasf.dataset.idPazienteProv = p.IDPazienteProv;
            b_annulla_trasf.innerHTML = `<i class="bi bi-x-circle"></i> Annulla trasf.`;  
            b_dimetti.innerHTML = `<i class="bi bi-x-circle"></i> Dimetti`;

            b_annulla_trasf.addEventListener("click", async () => {

                // 1) Recupero ID letto provvisorio
                const resLetto = await fetch(`/territorio/getIDPostolettoProv/${p.IDPazienteProv}`);
                
                const lettoProv = await resLetto.json();
                // 2) Annulla trasferimento
                await fetch(`/territorio/annullaTasferimento/${lettoProv}/${p.IDPaziente}/${IDUtente}/${p.IDPazienteProv}`);
                await caricaSetting(IDUtente, livelloAccesso);
                //await caricaSetting(IDUtente, livelloAccesso,7);
                // 3) Refresh tabelle
                document.getElementById("tabellaTrasf").innerHTML = "";
                generaTabellaPostiLiberi(IDUtente, "tabellaTrasf", livelloAccesso);                
                await generaTabellaPazienti(settings, "tabellaTrasf", livelloAccesso);  
                tabellaDimissioni(containerId, IDUtente, livelloAccesso, generaTabellaPostiLiberi, caricaSetting, settings,generaTabellaPazienti);            
               
            });
           
            b_dimetti.addEventListener("click", async () => {
                // Opzionale: Chiedi conferma prima di dimettere
                if (!confirm("Sei sicuro di voler dimettere il paziente?")) return;

                try {
                    // Eseguiamo la fetch specificando il metodo POST (più sicuro per le modifiche)
                    const response = await fetch(`/territorio/dimettiPaziente/${p.IDPaziente}/${p.IDPostoLetto}/50/${IDUtente}`);

                    // CRITICO: fetch NON va nel catch se il server risponde con errore (es. 500). 
                    // Dobbiamo controllare response.ok
                    if (!response.ok) {
                        throw new Error(`Errore del server: ${response.status} ${response.statusText}`);
                    }

                    // Se arriviamo qui, l'operazione ha avuto successo
                    alert("Paziente dimesso con successo!");
                    await caricaSetting(IDUtente, livelloAccesso);
                //await caricaSetting(IDUtente, livelloAccesso,7);
                // 3) Refresh tabelle
                document.getElementById("tabellaTrasf").innerHTML = "";
                generaTabellaPostiLiberi(IDUtente, "tabellaTrasf", livelloAccesso);                
                await generaTabellaPazienti(settings, "tabellaTrasf", livelloAccesso); 
                    // Aggiorna la tabella
                    tabellaDimissioni(
                        containerId,
                        IDUtente,
                        livelloAccesso,
                        generaTabellaPostiLiberi,
                        caricaSetting,
                        settings,
                        generaTabellaPazienti
                    );

                } catch (error) {
                    console.error("Errore durante la dimissione:", error);
                    alert("Si è verificato un errore durante la dimissione del paziente.");
                }
            });

            tdBtnDimetti.appendChild(b_dimetti);
            tdBtn.appendChild(b_annulla_trasf);
            tr.appendChild(b_dimetti);
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

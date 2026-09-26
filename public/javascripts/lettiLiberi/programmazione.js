

async function programmazione(user, livelloAccesso,dataPrenota, attivaModal) {
   
    try {
        const response = await fetch(`/postiliberi/getProgrammazione/${user.IDUtente}`)
        if (response.ok) {
            const data = await response.json();
            
            const strutture = data.map(struttura => struttura.nomeAzienda);
            const uniqueStrutture = [...new Set(strutture)];
            generaTabellaPosti(data, uniqueStrutture, "dashboardReparti",dataPrenota);
        }
    } catch (error) {
        console.error("Errore durante il recupero dei dati della programmazione:", error);
    }
    const container = document.getElementById("dashboardReparti");
   
    
}
/**
 * Genera una tabella Bootstrap responsiva basata sui dati della query SQL
 * @param {Array} dati - L'array di oggetti restituito dal database
 * @param {String} idContenitore - L'ID dell'elemento HTML in cui inserire la tabella
 */
function generaTabellaPosti(dati, strutture, idContenitore,dataPrenota) {
    const contenitore = document.getElementById(idContenitore);
    if (!contenitore) return;
    // Se non ci sono dati, mostra un messaggio di avviso
    if (!dati || dati.length === 0) {
        contenitore.innerHTML = `<div class="alert alert-info">Nessun posto letto trovato per questo utente.</div>`;
        return;
    }
    
    strutture.forEach(struttura => {
        struttura = struttura.trim();
        const datiFiltrati = dati.filter(riga => riga.nomeAzienda.trim() === struttura);
        let html = `
      <div class="mb-3">
        <h5 class="fw-semibold text-dark mb-2">${struttura}</h5>
        <div class="table-responsive">
            <table class="table table-sm table-hover align-middle text-secondary small border-top mb-0" style="font-size: 0.875rem;">
                <thead class="table-light text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">   
                    <tr>
                        <th scope="col" class="py-2 text-dark">Setting</th>
                        <th scope="col" class="py-2 text-center text-dark" style="width: 80px;"><span class="badge bg-primary">M</span></th>
                        <th scope="col" class="py-2 text-center text-dark" style="width: 100px;"><span class="badge bg-danger">F</span></th>
                        <th scope="col" class="py-2 text-center text-dark" style="width: 100px;"> 
                        <!-- Aggiunto d-inline-flex e align-items-center per allineare l'icona al millimetro -->
                        <span class="badge bg-secondary d-inline-flex align-items-center">
                            <i class="bi bi-sigma me-1"></i> Totale
                        </span>
                        </th>
                        <th scope="col" class="py-2 text-center text-dark" style="width: 100px;"> 
                        <!-- Aggiunto d-inline-flex e align-items-center per allineare l'icona al millimetro -->
                        <span class="badge bg-secondary d-inline-flex align-items-center">
                            <i class="bi bi-sigma me-1"></i> Prenotati
                        </span>
                        </th>
                        <th scope="col" class="py-2 text-end text-dark" style="width: 90px;">Azioni</th>
                    </tr>
                </thead>
                <tbody>
    `;
        datiFiltrati.forEach(riga => {
            // Formattazione estetica del sesso (opzionale)
            let sessoBadge = riga.sesso === 'M'
                ? '<span class="badge bg-primary">M</span>'
                : (riga.sesso === 1 ? '<span class="badge bg-danger">F</span>' : `<span class="badge bg-secondary">M</span>`);

            html += `
             <tr class="border-bottom-0">
                <td class="text-dark fw-medium py-0">${riga.setting}</td>
                <td class="text-center py-0">${riga.totale_uomini}</td>
                <td class="text-center py-0">${riga.totale_donne}</td>
                <td class="text-center py-0">${riga.totale_posti}</td>
                <td class="text-center py-0">${riga.totale_prenotati}</td>
                
                <td class="text-end py-0">
                    <div class="btn-group btn-group-sm " role="group">
                        
                        <button class="btn btn-link text-danger p-1 link-danger ms-1" title="Elimina" data-id-setting="${riga.idSetting}" data-sesso="${riga.sesso}" >
                            <i class="bi bi-plus-lg"  id ="plus-${riga.idSetting}" data-id-setting="${riga.idSetting}"></i>
                        </button>                        
                        </div>
                        </td>
                        </tr>
                        <tr id="collapseSetting${riga.idSetting}">
                        </tr>
        `;
        });

        // Chiusura dei tag HTML
        html += `
                </tbody>
            </table>
        </div>
    </div>
   
    </div>
    `;

        // Inserisce la tabella nel DOM
        contenitore.appendChild(document.createRange().createContextualFragment(html));
    })


    // Inizio della struttura della tabella responsiva Bootstrap

    // Ciclo sui dati della query per generare le righe (tr)
}

// ---- FUNZIONI DI ESEMPIO PER I PULSANTI ----
window.azioneModifica = function azioneModifica(idPostoLetto, idSetting, dataPrenota) {       
    attivaModal(null, idPostoLetto, idSetting, "prenotaModal");
    // Qui inserirai la logica (es. apertura di una modale Bootstrap)
}

window.azioneCancella = function azioneCancella(idSetting, sesso) {
    if (confirm(`Sei sicuro di voler cancellare i posti per ID Setting: ${idSetting} (${sesso})?`)) {
        alert("Eliminazione confermata");
        // Qui inserirai la chiamata AJAX/Fetch per eliminare i dati
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const livelloAccesso = localStorage.getItem("livelloAccesso");
    if (user && livelloAccesso) {
        programmazione(user, livelloAccesso);
    } else {
        console.error("Utente o livello di accesso non trovati in localStorage.");
    }
});
document.addEventListener("click", (event) => {
    const elementoCliccato = event.target.closest(".btn-prenota");    
    if (elementoCliccato) {
        event.preventDefault();        
        const idPostoLetto = elementoCliccato.dataset.idPostoLibero;
        const idSetting = elementoCliccato.dataset.idSetting;
        const sesso = elementoCliccato.dataset.sesso;  
        attivaModal(null, idPostoLetto, idSetting, "prenotaModal");
    }

    if (event.target.closest(".btn-link")) {
        event.preventDefault();
        
        const contenitore = document.getElementById("collapseSetting" + event.target.dataset.idSetting);
        if (!event.target.dataset.idSetting) return; // Se non c'è l'ID, esci
        if (event.target.classList.contains("bi-dash-lg")) {
            const icona = event.target.closest('i'); // Trova l'icona più vicina al click
            contenitore.innerHTML = "";
            icona.classList.toggle('bi-plus-lg');
            icona.classList.toggle('bi-dash-lg');
            return;
        }

        const icona = event.target.closest('i'); // Trova l'icona più vicina al click

        if (!icona) return; // Se non è l'icona con il dataset, ignora il click

        // 1. Recuperiamo l'ID della riga (in camelCase!)
        const idSetting = icona.dataset.idSetting;
        

        // 2. Facciamo il TOGGLE delle classi di Bootstrap
        // bi-plus-lg è il "+", bi-dash-lg è il "-"
        icona.classList.toggle('bi-plus-lg');
        icona.classList.toggle('bi-dash-lg');


        let html = `
      <div class="mb-3 border border-secondary border-top pt-2 mt-2">
       
        <div class="table-responsive">
            <table class="table table-sm table-hover  align-middle text-secondary small border-top mb-0" style="font-size: 0.875rem;">
                <thead class="table-light text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">   
                    <tr>
                       
                        <th scope="col" class="py-2 text-center text-dark" style="width: 80px;">Sesso</th>
                        
                        <th scope="col" class="py-2 text-end text-dark" style="width: 90px;">Azioni</th>
                    </tr>
                </thead>
                <tbody>
        `;
        const letti = fetch(`/postiliberi/lettiLiberiSetting/${event.target.dataset.idSetting}`)
            .then(response => response.json())
            .then(data => {                
                data.forEach(riga => {
                   
                    html += `
                <tr class="border-bottom-0 ">
                    <td class="text-dark fw-medium py-0 text-center">${riga.sesso === 2 ? `<span class="d-inline-flex align-items-center fw-bold" style="color: #2b7fff; font-size: 0.875rem;align-middle">
                        <i class="bi bi-gender-male me-1" style="-webkit-text-stroke: 0.8px;"></i>
                        </span>` : `<span class="d-inline-flex align-items-center fw-bold" style="color: #f5a6f5; font-size: 0.875rem;">
                        <i class="bi bi-gender-female me-1" style="-webkit-text-stroke: 0.8px;"></i>
                        </span>`}
                    </td>
                    <td class="text-end py-0">
                        <div class="btn-group btn-group-sm " role="group">                      
                            <button class="btn btn-prenota text-secondary p-1 link-dark" data-bs-toggle="tooltip" 
                            data-bs-placement="top" title="Prenota"                            
                            data-id-posto-libero="${riga.idPostoLibero}" 
                            data-id-setting="${riga.idSetting}" 
                            data-sesso="${riga.sesso}">
                                <i class="bi bi-pencil-square fs-6"></i>
                            </button>
                            <!-- Pulsante Elimina (Icona Cestino Rosso soft) -->
                            <button class="btn btn-elimina text-danger p-1 link-danger ms-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Elimina" data-id-setting="${riga.idSetting}" data-sesso="${riga.sesso}" onclick="azioneCancella(${riga.idSetting}, '${riga.sesso}')">
                                <i class="bi bi-trash3 fs-6"></i>
                            </button>
                                                
                        </div>
                    </td>
                </tr>
                `;
                });
                html += `
                </tbody>
            </table>
        </div>
    </div>
    `;

                // Inserisce la tabella nel DOM
                contenitore.appendChild(document.createRange().createContextualFragment(html));
            })
            .catch(error => {
                console.error("Errore nel recupero dei letti liberi:", error);
            });

    }

});

export { programmazione }

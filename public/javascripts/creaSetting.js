async function caricaSetting(IDUtente, livelloAccesso,settingUtente, datiForm) {
    try {

        const response = await fetch(`/settingUtente/${IDUtente}`);
        const reparto = await response.json();
        document.getElementById('dashboardReparti').innerHTML = "";
        settingUtente = [];
        reparto.forEach(setting => {
            settingUtente.push(setting.IDSetting);
            const aggancio = document.getElementById('dashboardReparti');
            aggancio.appendChild(creaReparto(setting.setting, setting.IDSetting, livelloAccesso, datiForm));

        });

    } catch (error) {
        console.error('Errore nella routine caricasetting:', error);
    }
}
async function caricaStatoLetti(configurazioneForm) {
    try {
        const response = await fetch(`/statoletti`);
        const lettoLetti = await response.json();

        lettoLetti.forEach(letto => {
            configurazioneForm.find(el => el.id === 'IDStatoLetto').options.push(letto.stato);
            configurazioneForm.find(el => el.id === 'IDStatoLetto').values.push(letto.IDStato);
        });
    } catch (error) {
        console.error('Errore:', error);
    }
}
function creaReparto(nome, IDSetting, livelloAccesso, datiForm) {
    const reparto = document.createElement("div");
    reparto.className = "reparto";
    let pulsantiLetto = "";
    if (livelloAccesso >= 50) {
        pulsantiLetto = `<svg width="45" height="30" viewBox="0 0 45 30" xmlns="http://w3.org" class="piu svg-button">
    <rect x="0.5" y="0.5" width="44" height="29" fill="none"  rx="5" ry="5"  stroke="#000000" stroke-width="1"class='piu'/>
      <!-- testata con bordo nero -->
      <rect x="3" y="11" width="4" height="11" rx="2" ry="2" fill="#ff8800" stroke="#000000" stroke-width="1"/>
      
      <!-- lettino con bordo nero -->
      <rect x="6" y="12.5" width="25" height="7.5" rx="3.5" ry="3.5" fill="#ff8800" stroke="#000000" stroke-width="1" class='meno'/>
      
      <!-- pulsante PIÙ (cerchio nero con + bianco) -->
      <g transform="translate(32,7.5)">
        <circle cx="5" cy="5" r="5" fill="#000000" stroke="#000000" stroke-width="1"/>
        <!-- linea orizzontale -->
        <line x1="2.5" y1="5" x2="7.5" y2="5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>
        <!-- linea verticale -->
        <line x1="5" y1="2.5" x2="5" y2="7.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>
      </g>
    </svg>
    <svg width="45" height="30" viewBox="0 0 45 30" xmlns="http://w3.org" class="meno svg-button">
    <rect x="0.5" y="0.5" width="44" height="29" fill="none"  rx="5" ry="5"  stroke="#000000" stroke-width="1"/>
      <!-- testata con bordo nero -->
    
    
      <rect x="3" y="11" width="4" height="11" rx="2" ry="2" fill="#ff8800" stroke="#000000" stroke-width="1" class='meno'/>
      
      <!-- lettino con bordo nero -->
      <rect x="6" y="12.5" width="25" height="7.5" rx="3.5" ry="3.5" fill="#ff8800" stroke="#000000" stroke-width="1" class='meno'/>
      
      <!-- pulsante MENO (cerchio nero con - bianco) -->
      <g transform="translate(32,7.5)">
        <circle cx="5" cy="5" r="5" fill="#000000" stroke="#000000" stroke-width="1"/>
        <!-- linea orizzontale -->
        <line x1="2.5" y1="5" x2="7.5" y2="5" stroke="#ffffff" stroke-width="1" stroke-linecap="round"/>
      </g>
    </svg>
            </div>
    `}
    ;

    // HTML base del reparto
    reparto.innerHTML = `
        <h6 >${nome}</h6>
        <div class="letti-container"></div>
       ${pulsantiLetto}
        
        
`;

    /* 
    ///gestione del boarding dei pazienti
    /// 
    */
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('piu')) {
            alert("volevi aggiungere un pz in boarding");
            const response = await fetch(`/aggiuntaBoarding/${IDSetting}`);
            if (!response.ok) {
                throw new Error("non ho ricevuto i dati del letto");
            }
            const dati = await response.json();
            caricaSetting(IDUtente, livelloAccesso,settingUtente)

        }
        if (e.target.classList.contains('meno')) {
            alert("volevi togliere un pz in boarding");
            const response = await fetch(`/sottraiBoarding/${IDSetting}`);

            if (!response.ok) {
                throw new Error("non ho ricevuto i dati del letto");
            }
            const dati = await response.json();
            caricaSetting(IDUtente, livelloAccesso,settingUtente)
            console.log(dati);
        }
    });
    // ORA la letti-container esiste
    const containerLetti = reparto.querySelector(".letti-container");

    // Fetch letti

    fetch(`/letti/${IDSetting}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(letto => {                // Ottieni stato, colore e icona
                const [statoLetto, bgcolor, icona] = assegnaStato(
                    letto.IDStatoLetto,
                    letto.dataInserimento,
                    letto.dataTrafPrevista,
                    letto.dataTrasf,
                    letto.sesso,
                    letto.numeroStanza
                );


                // Crea SVG letto
                const lettoElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

                lettoElement.setAttribute("viewBox", "0 0 28 34");
                lettoElement.ID = `letto-${letto.IDPostoLetto}`;
                lettoElement.dataset.IDPostoLetto = letto.IDPostoLetto;
                lettoElement.dataset.IDSetting = IDSetting;


                // Colore dinamico
                lettoElement.style.setProperty("--bg-letto-dinamico", bgcolor || "#e0e0e0");
                let pzDimesso = "Trasf Pz";


                let aPaziente = `<g onclick="assegnaPaziente(event, ${letto.IDPostoLetto}, ${letto.IDStatoLetto})">`;
                if (letto.IDPaziente !== null) {
                    //lettoElement.style.setProperty("--bg-letto-dinamico", "#ff4fa3");
                    pzDimesso = letto.nomePaziente.substring(0, 1) + " " + letto.cognomePaziente.substring(0, 1);
                };
                // Stati non consentiti: inseriamo gli ID in un array per pulizia
                if (icona) {
                    lettoElement.innerHTML = icona;
                } else {
                    // Altrimenti disegna il letto
                    lettoElement.innerHTML = `
                    <text x="14" y="4" font-size="6" font-weight="bold" text-anchor="middle" fill="#000">
                    L.${letto.numeroLetto || ""} - S.${letto.numeroStanza || ""}
                    </text>
                    <rect x="4" y="6" width="6" height="4" rx="1" fill="var(--bg-letto-dinamico)"></rect>
                    <rect x="4" y="10" width="20" height="8" rx="2" fill="var(--bg-letto-dinamico)"></rect>
                    <text x="14" y="28" font-size="6" font-weight="bold" text-anchor="middle" fill="#333">${statoLetto}</text>
                    ${aPaziente}
                    <rect x="1" y="29" width="27" height="8" fill="white" stroke="#333" stroke-width="0.5" rx="2" ry="2"/>
                    <text x="14" y="36" font-size="5" font-weight="bold" text-anchor="middle" fill="#333" >
                       ${pzDimesso}
                    </text>
                    </g>
                        `;
                }

                // Append letto
                containerLetti.appendChild(lettoElement);

                // Click letto
                lettoElement.addEventListener("click", () => {
                    if(livelloAccesso<50){
                       attivaModal(event, datiForm.IDPostoLetto, IDSetting, "modale"); 
                    }
                    toggleLetto(lettoElement, reparto);

                });
            });

            aggiornaContatori(reparto);

        })
        .catch(error => console.error("Errore:", error));

    return reparto;
}
function assegnaStato(IDStatoLetto, dataIngresso = null, dataPresuntoTrasferimento = null, dataTrasferimento = null, sesso = null, numeroStanza = null) {
    let statoLetto = null;
    let bgcolor = '#e0e0e0'; // default
    let icona = null;


    switch (IDStatoLetto) {
        case 15:
            // Stato
            statoLetto = 'P';
            // Icone SVG
            const iconaDonna = `
            <text x="14" y="6" font-size="6" font-weight="bold" text-anchor="middle" fill="#000">
                ${numeroStanza || ""}
            </text>

            <g transform="translate(6, 10) scale(0.6)" fill="#ff4fa3">
                <path d="M14 5a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"/>
                <path d="M10 7c-.5 2 3.5 2 3 0c-.3-1.5-2.7-1.5-3 0Z"/>
                <path d="M9 22H7l2-7-3-2 1.5-2L11 14l1-3 2-1 2 2-1 3 2 7h-2l-1.5-4L11 18l-2 4Z"/>
            </g>

            <text x="14" y="32" font-size="7" font-weight="bold" text-anchor="middle" fill="#333">
                in Dim
            </text>
            `;

            const iconaUomo = `
                <text x="14" y="6" font-size="6" font-weight="bold" text-anchor="middle" fill="#000">
                    ${numeroStanza || ""}
                </text>

                <g transform="translate(6, 10) scale(0.6)" fill="#5653de">
                    <path d="M14 5a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"/>
                    <path d="M10 7c-.5 2 3.5 2 3 0c-.3-1.5-2.7-1.5-3 0Z"/>
                    <path d="M9 22H7l2-7-3-2 1.5-2L11 14l2-4 3 1-2 5 2 6h-2l-1.5-4L11 18l-2 4Z"/>
                </g>

                <text x="14" y="32" font-size="7" font-weight="bold" text-anchor="middle" fill="#333">
                    in Dim
                </text>
                `;

            // 🔥 PRIORITÀ: se ci sono date → viola


            if (dataPresuntoTrasferimento !== null || dataTrasferimento !== null) {
                bgcolor = 'purple';
                icona = sesso === 1 ? iconaDonna : iconaUomo;
            }
            else {
                // 🔥 Colore in base al sesso
                if (sesso === 1) {
                    bgcolor = 'pink';
                    icona = "";
                } else {
                    bgcolor = 'lightblue';
                    icona = "";
                }
            }

            break;
        case 2:
            statoLetto = 'CHUSO';
            // Codice eseguito se espressione === valore2
            bgcolor = 'red';
            break;
        case 3:
            statoLetto = 'CHIUSO ES';
            bgcolor = '#e0c4a7';
            break;
        case 14:
            statoLetto = 'LIBERO';
            bgcolor = 'lightgreen';
            break;
        case 13:
            statoLetto = 'OCC.';
            bgcolor = 'red';
            break;
        case 16: // IN DIMISSINE
            statoLetto = 'DIM.';
            bgcolor = 'yellow';
            break;

        default:
            // Codice eseguito se nessun case corrisponde
            statoLetto = null;
    }

    return [statoLetto, bgcolor, icona];
}
function toggleLetto(letto, reparto) {

    datiForm.IDSetting = letto.dataset.IDSetting;
    datiForm.IDPostoLetto = letto.dataset.IDPostoLetto;


    if (letto.classList.contains("libero")) {
        letto.classList.remove("libero");
        letto.classList.add("occupato-uomo");
    } else if (letto.classList.contains("occupato-uomo")) {
        letto.classList.remove("occupato-uomo");
        letto.classList.add("occupato-donna");
    } else {
        letto.classList.remove("occupato-donna");
        letto.classList.add("libero");
    }

    aggiornaContatori(reparto);
}
function aggiornaContatori(reparto) {
    const liberi = reparto.querySelectorAll(".letto.libero").length;
    const uomini = reparto.querySelectorAll(".letto.occupato-uomo").length;
    const donne = reparto.querySelectorAll(".letto.occupato-donna").length;
    //reparto.querySelector(".liberi").textContent = liberi;
    // reparto.querySelector(".uomini").textContent = uomini;
    //reparto.querySelector(".donne").textContent = donne;
}

export {caricaSetting, caricaStatoLetti, creaReparto}
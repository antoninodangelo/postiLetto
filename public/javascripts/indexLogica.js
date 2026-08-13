let setting = [];
let settingAttivo = null;
let settingsZona = [];
const configurazioneFormDx=[
{
        id: 'IDPaziente',
        label: 'Identificativo Paziente',
        type: 'text',
        required: false,
        disabled: true
    },
    {
        id: 'IDPostoLetto',
        label: 'ID Letto',
        type: 'text',
        required: false,
        disabled: true
    },
        {
        id: 'nomePaziente',
        label: 'nome',
        type: 'text',
        required: true,
        disabled: false
    },
    {
        id: 'cognomePaziente',
        label: 'nome',
        type: 'text',
        required: true,
        disabled: false
    },
    {
        id: 'dataNascita',
        label: 'data di nascita',
        type: 'date',
        required: true,
        disabled: false
    },
    {
        id: 'dataInserimento',
        label: 'data ingresso',
        type: 'date',
        required: true,
        disabled: false
    },
    {
        id: 'sesso',
        label: 'Sesso',
        type: 'select',
        options: ['DONNA','UOMO'],
        values: [1,2]
    },
    {
        id: 'settingDestinazioneProgrammato',
        label: 'Destinazione programmata',
        type: 'select',
        options: [],
        values: []
    },
    {
        id: 'settingDestinazione',
        label: 'Destinazione',
        type: 'select',
        options: [],
        values: []
    },
    {
        id: 'dataTrafPrevista',
        label: 'data trasferimento prevista',
        type: 'date',
        required: true,
        disabled: false
    },
    {
        id: 'dataTrasf',
        label: 'data trasferimento',
        type: 'date',
        required: true,
        disabled: false
    },
    {
        id: 'dataDimissione',
        label: 'data dimissione',
        type: 'date',
        required: true,
        disabled: false
    },
    {
        id: 'IDStatoPaziente',
        label: 'Stato Paziente',
        type: 'select',
        options: [],
        values: []
    },
    {
        id: 'note',
        label: 'note',
        type: 'text',
        required: true,
        disabled: false
    }
];
const datiformDx={
IDPostoLetto:null,
IDPaziente:null,
nomePaziente:null,
cognomePaziente:null,
dataNascita:null,
dataInserimento:null,
sesso:null,
settingDestinazioneProgrammato:null,
settingDestinazione:null,
dataTrafPrevista:null,
dataTrasf:null,
dataDimissione:null,
IDStatoPaziente:null,
note:null
};
const configurazioneForm = [
    {
        id: 'idPostoLetto',
        label: 'ID Letto',
        type: 'text',
        required: false,
        disabled: true
    },
    {
        id: 'IDSetting',
        label: 'ID Setting',
        type: 'text',
        required: false,
        disabled: true
    },
    {
        id: 'idStatoLetto',
        label: 'Stato Letto',
        type: 'select',
        options: [],
        values: []
    },

    {
        id: 'idTipoLetto',
        label: 'Tipo Letto',
        type: 'select',
        options: ['LETTO', 'BARELLA', 'POLTRONA'],
        values: [1, 2, 3]
    },
    {
        id: 'numeroStanza',
        label: 'Numero Stanza',
        type: 'select',
        options: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        values: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30] // Valori corrispondenti da inviare al server
    },
    {
        id: 'numeroLetto',
        label: 'Numero Letto',
        type: 'text',
        required: true,
        disabled: false
    },

    {
        id: 'note',
        label: 'Note Extra',
        type: 'textarea',
        placeholder: 'Inserisci eventuali note cliniche o logistiche...'
    }
];

// 2. OGGETTO DI APPOGGIO DATI: Qui verranno salvati i valori inseriti dall'utente
let datiForm = {
    idPostoLetto: 1,
    IDSetting: null,
    numeroLetto: 1,
    idStatoLetto: 1,
    idTipoLetto: 1,
    numeroStanza: 1,
    note: ''
};
document.addEventListener("DOMContentLoaded", caricaDati);
async function caricaDati() {
    caricaAziende();
    await caricaStatoLetti();
    await caricaStatiPostoLettoDx();

}
async function caricaStatiPostoLettoDx(){
    const response = await fetch('/getStatoPazienti');
    const data = await response.json();

    console.log(data.dati, 'questi sono gli stati del pazienti');

    data.dati[0].forEach(el => {
        // controlli di sicurezza
        
        console.log(el,'questo e lelemtn');
        configurazioneFormDx.find(e => e.id === 'IDStatoPaziente').options.push(el.stato);
        configurazioneFormDx.find(e => e.id === 'IDStatoPaziente').values.push(el.IDStatoPaziente);
    });
    console.log(configurazioneFormDx)
}

/**
 * ROUTINE: Genera il form e mappa i dati in tempo reale
 * @param {Array} config - L'array di configurazione dei campi
 * @param {Object} storage - L'oggetto dove salvare i dati inseriti
 * @param {string} idFormHTML - L'ID del form HTML di destinazione
 */
function generaFormDinamico(config, storage, idFormHTML) {
    const formElement = document.getElementById(idFormHTML);
    if (!formElement) return console.error("Form non trovato nell'HTML");

    formElement.innerHTML = ''; // Pulisce il form da vecchi elementi

    config.forEach(campo => {
        // Crea il contenitore del gruppo (form-group / mb-3)
        const wrapper = document.createElement('div');
        wrapper.className = 'mb-3 d-flex flex-column text-start';

        // Crea la Label
        const label = document.createElement('label');
        label.htmlFor = campo.id;
        label.className = 'form-label fw-bold mb-1';
        label.innerText = campo.label;
        wrapper.appendChild(label);

        // Variabile di supporto per l'elemento di input specifico
        let input;

        // Gestione dei diversi tipi di campo (Select, Textarea o Input standard)
        if (campo.type === 'select') {
            input = document.createElement('select');
            campo.options.forEach(opzione => {
                const opt = document.createElement('option');
                opt.value = campo.values ? campo.values[campo.options.indexOf(opzione)] : opzione; // Usa il valore corrispondente se definito, altrimenti l'opzione stessa
                opt.innerText = opzione;
                if (storage[campo.id] == opt.value) opt.selected = true;
                input.appendChild(opt);
            });
        } else if (campo.type === 'textarea') {
            input = document.createElement('textarea');
            if (campo.placeholder) input.placeholder = campo.placeholder;
            input.rows = 3;
        } else if(campo.type ==='data'){}
        else {
            input = document.createElement('input');
            input.type = campo.type;
            if (campo.placeholder) input.placeholder = campo.placeholder;
            if (campo.required) input.required = true;
            if (campo.disabled) input.disabled = true;
            storage[campo.id] = storage[campo.id] || ''; // Inizializza il valore nello storage se non presente
        }

        // Proprietà comuni a tutti i campi
        input.id = campo.id;
        input.className = 'form-control'; // Classe CSS standard (ottima per Bootstrap)


        // Sincronizza il valore iniziale dall'oggetto di appoggio
        input.value = storage[campo.id] || '';

        // EVENTO INPUT/CHANGE: Aggiorna l'oggetto di appoggio ad ogni digitazione
        input.addEventListener('input', (e) => {
            storage[campo.id] = e.target.value;
            console.log("Dati aggiornati in tempo reale:", storage);
        });

        // Appende l'input al wrapper e il wrapper al form principale
        wrapper.appendChild(input);
        formElement.appendChild(wrapper);
    });

    // Aggiunge un pulsante di invio finale per il form
    const btnInvia = document.createElement('button');
    btnInvia.type = 'submit';
    btnInvia.className = 'btn btn-primary mt-2 w-100';
    btnInvia.innerText = 'Salva Dati';
    formElement.appendChild(btnInvia);

    // Gestione del submit finale del form
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('selectSetting')) {
            document.getElementById('selectSetting').remove();
        }
        try {
            const response = await fetch('/salvaDatiLetto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storage)
            });

            const data = await response.json();
            // Ricarico i settings aggiornati
            const settings = await caricaSetting(document.getElementById('selectZone').value);
            dashboard.innerHTML = ""; // pulizia

            settings.forEach(element => {
                dashboard.appendChild(creaReparto(element.setting, element.IDSetting));
            });
            const settingAttivo = document.getElementById("selectSetting");
            if (settingAttivo) {
                settingAttivo.value = storage.IDSetting;
                creaRepartoSempliceDx(settingAttivo.options[settingAttivo.selectedIndex].text || "Reparto Demo", storage.IDSetting);
            } else {
                console.warn("Select dei setting non trovata!");
            }


        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
        }
        chiudiModal();
    })

}

async function caricaAziende() {
    try {
        const response = await fetch('/aziende');
        const data = await response.json();

        // 1) CREA LA SELECT COMPLETA
        const select = document.createElement('select');
        select.id = "selectAziende";
        select.style.display = "inline-block";
        select.style.marginRight = "10px";
        select.style.width = "auto"
        select.classList.add("form-select"); // opzionale (Bootstrap)

        // 2) AGGIUNGI UN'OPZIONE DI DEFAULT
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.textContent = "Seleziona un'azienda...";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        // 3) POPOLA LA SELECT CON I DATI
        data.forEach(azienda => {
            const option = document.createElement('option');
            option.value = azienda.IDAzienda;
            option.textContent = `${azienda.IDAzienda} - ${azienda.nomeAzienda}`;
            select.appendChild(option);
        });

        // 4) APPENDI LA SELECT A secondMenu
        const container = document.getElementById('secondMenu');
        container.innerHTML = ""; // pulizia
        container.appendChild(select);

    } catch (error) {
        console.error('Errore:', error);
    }


    document.getElementById('secondMenu').addEventListener('change', async (e) => {
        if (e.target.id === "selectAziende") {
            const taragetAziende = e.target.value;
            if (document.getElementById('selectZone')) {
                document.getElementById('selectZone').remove();
            }

            await caricaAreaTerritoriale(taragetAziende);
        }
    });

    document.getElementById('secondMenu').addEventListener('change', async (e) => {
        if (e.target.id === "selectZone") {
            const taragetZone = e.target.value;
            if (document.getElementById('selectSetting')) {
                document.getElementById('selectSetting').remove();
            }
            settings = await caricaSetting(taragetZone);

            dashboard.innerHTML = ""; // pulizia
            settings.forEach(element => {
                dashboard.appendChild(creaReparto(element.setting, element.IDSetting));
                // devo prelevare i dati dei letti da ogni setting  
            });
        }
    });
}

async function caricaAreaTerritoriale(IDAzienda = 1) {
    try {
        const response = await fetch(`/zone/${IDAzienda}`);
        const data = await response.json();

        // 1) CREA LA SELECT COMPLETA
        const select = document.createElement('select');
        select.id = "selectZone";
        select.style.width = "auto"
        select.style.display = "inline-block";
        select.style.marginRight = "10px";
        select.classList.add("form-select"); // opzionale (Bootstrap)

        // 2) AGGIUNGI UN'OPZIONE DI DEFAULT
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.textContent = "Seleziona un'area territoriale...";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);

        // 3) POPOLA LA SELECT CON I DATI
        data.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.IDZona;
            option.textContent = `${zone.IDZona} - ${zone.zona}`;
            select.appendChild(option);
        });

        // 4) APPENDI LA SELECT A secondMenu
        const container = document.getElementById('secondMenu');
        // container.innerHTML = ""; // pulizia
        container.appendChild(select);

    } catch (error) {
        console.error('Errore:', error);
    }
}

async function caricaSetting(IDZona = 1) {
    try {
        const response = await fetch(`/setting/${IDZona}`);
        const setting = await response.json();


        // 1) CREA LA SELECT COMPLETA
        if (document.getElementById('selectSetting')) {
            document.getElementById('selectSetting').remove();
        }
        const select = document.createElement('select');
        select.id = "selectSetting";
        select.style.width = "auto"
        select.style.display = "inline-block";
        select.style.marginRight = "10px";
        select.classList.add("form-select"); // opzionale (Bootstrap)

        // 2) AGGIUNGI UN'OPZIONE DI DEFAULT
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.textContent = "Seleziona un setting...";
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);
        const settingFrom = [];
        // 3) POPOLA LA SELECT CON I DATI
        setting.forEach(setting => {
            const option = document.createElement('option');
            option.value = setting.IDSetting;
            option.textContent = `${setting.IDSetting} - ${setting.setting}`;
            select.appendChild(option);
            settingFrom.push(setting.setting);

        });
        //configurazioneForm.find(el => el.setting === setting.setting).options = settingFrom;
        // 4) APPENDI LA SELECT A secondMenu
        const container = document.getElementById('secondMenu');

        container.appendChild(select);
        select.addEventListener('change', (e) => {
            const IDSetting = e.target.value;
            settingAttivo = IDSetting;

            creaRepartoSempliceDx(select.options[select.selectedIndex].text, settingAttivo);
        });
        return setting;

    } catch (error) {
        console.error('Errore:', error);
    }
}
async function caricaStatoLetti() {
    try {
        const response = await fetch(`/statoletti`);
        const lettoLetti = await response.json();

        lettoLetti.forEach(letto => {
            configurazioneForm.find(el => el.id === 'idStatoLetto').options.push(letto.stato);
            configurazioneForm.find(el => el.id === 'idStatoLetto').values.push(letto.IDStato);            
        });
        console.log('idStatoLetto', configurazioneForm.find(el => el.id === 'idStatoLetto').options);
        console.log('idStatoLetto', configurazioneForm.find(el => el.id === 'idStatoLetto').values);
    } catch (error) {
        console.error('Errore:', error);
    }
}


function creaReparto(nome, IDSetting) {

    const reparto = document.createElement("div");
    reparto.className = "reparto";

    // HTML base del reparto
    reparto.innerHTML = `
        <h6>${nome}</h6>
        <div class="letti-container"></div>
       
        <div class="contatori">
            Liberi: <span class="liberi">0</span> |
            Occupati Uomini: <span class="uomini">0</span> |
            Occupati Donne: <span class="donne">0</span>
        </div>
    `;

    // ORA la letti-container esiste
    const containerLetti = reparto.querySelector(".letti-container");

    // Fetch letti
    fetch(`/letti/${IDSetting}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(letto => {

                // Ottieni stato, colore e icona
                const [statoLetto, bgcolor, icona] = assegnaStato(
                    letto.IDStatoLetto,
                    letto.dataIngresso,
                    letto.dataTrafPrevista,
                    letto.dataTrasf,
                    letto.sesso,
                    letto.numeroStanza
                );

                // Crea SVG letto
                const lettoElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");

                lettoElement.setAttribute("viewBox", "0 0 28 34");
                lettoElement.id = `letto-${letto.IDPostoLetto}`;
                lettoElement.dataset.idPostoLetto = letto.IDPostoLetto;
                lettoElement.dataset.IDSetting = IDSetting;

                // Colore dinamico
                lettoElement.style.setProperty("--bg-letto-dinamico", bgcolor || "#e0e0e0");

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
                        <text x="14" y="29" font-size="7" font-weight="bold" text-anchor="middle" fill="#333">${statoLetto}</text>
                    `;
                }

                // Append letto
                containerLetti.appendChild(lettoElement);

                // Click letto
                lettoElement.addEventListener("click", () => {
                    datiForm.IDSetting = IDSetting;
                    const settingAttivo = document.getElementById("selectSetting");
                    creaRepartoSempliceDx(settingAttivo.options[settingAttivo.selectedIndex].text || "Reparto Demo", IDSetting);
                    toggleLetto(lettoElement, reparto);
                });
            });

            aggiornaContatori(reparto);
        })
        .catch(error => console.error("Errore:", error));

    // Click sul contenitore letti → aggiorna select
    containerLetti.addEventListener("click", () => {

        const settingAttivo = document.getElementById("selectSetting");
        if (settingAttivo) {
            settingAttivo.value = IDSetting;
            creaRepartoSempliceDx(settingAttivo.options[settingAttivo.selectedIndex].text || "Reparto Demo", IDSetting);
        } else {
            console.warn("Select dei setting non trovata!");
        }
        datiForm.IDSetting = IDSetting;
    });

    return reparto;
}


function creaRepartoSempliceDx(nome, IDSetting) {
    const gancio = document.getElementById("contenitoreLettoDx");

    if (!gancio) return;

    document.getElementById("titoloLettiReparto").textContent = nome;

    fetch(`/letti/${IDSetting}`)
        .then(response => response.json())
        .then(data => {
            const bedsRowContainer = document.createElement("div");
            bedsRowContainer.classList.add("beds-row-container");

            data.forEach(letto => {
                console.log("Dati letto:", letto);
                const [statoLetto, bgcolor, icona] = assegnaStato(
                    letto.IDStatoLetto,
                    letto.dataIngresso,
                    letto.dataTrafPrevista,
                    letto.dataTrasf,
                    letto.sesso,
                    letto.numeroStanza
                );

                const bedRow = document.createElement("div");
                bedRow.classList.add("bed-row");

                const bedIconWrapper = document.createElement("div");
                bedIconWrapper.classList.add("bed-icon");

                const lettoElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                lettoElement.setAttribute("viewBox", "0 0 80 80");
                lettoElement.id = `letto-${letto.IDPostoLetto}`;

                // Utilizzo di setAttribute per evitare l'errore del dataset undefined riscontrato prima
                lettoElement.setAttribute("data-id-posto-letto", letto.IDPostoLetto);
                lettoElement.setAttribute("data-i-d-setting", IDSetting);
                lettoElement.dataset.modale='modaleDx';
                lettoElement.style.setProperty("--bg-letto-dinamico", bgcolor || "#e0e0e0");

                if (icona) {
                    lettoElement.innerHTML = icona;
                } else {
                    lettoElement.innerHTML = `
                    <text x="40" y="12" font-size="9" font-weight="bold" text-anchor="middle" fill="#000">
                        L.${letto.numeroLetto || ""} - S.${letto.numeroStanza || ""}
                    </text>
                    <rect x="26" y="11" width="8" height="7" rx="1" fill="var(--bg-letto-dinamico)"></rect>
                    <rect x="26" y="18" width="38" height="18" rx="2" fill="var(--bg-letto-dinamico)"></rect>
                    <text x="40" y="52" font-size="10" font-weight="bold" text-anchor="middle" fill="#333">${statoLetto}</text>
                    `;
                }

                // 5. 🔥 Crea l'elemento info e inserisci il testo scelto da te
                const bedInfo = document.createElement("div");
                bedInfo.classList.add("bed-info");

                // Puoi comporre il testo usando i dati dell'oggetto letto (es: Cognome, Nome, Diagnosi)
                // Se la proprietà non esiste nell'oggetto, verrà mostrata la stringa alternativa
                const nomePaziente = letto.pazienteNome || "Posto Libero";
                const dettagliAggiuntivi = letto.note ? ` - ${letto.note}` : "";

                bedInfo.innerHTML = `
                    <strong style="display: block; color: #333; font-size: 14px;">${nomePaziente}</strong>
                    <span style="color: #666; font-size: 12px;">Stato: ${statoLetto}${dettagliAggiuntivi}</span>
                `;

                // 6. Assembla la singola riga
                bedIconWrapper.appendChild(lettoElement);
                bedRow.appendChild(bedIconWrapper);
                bedRow.appendChild(bedInfo); // Appende il testo a destra dell'icona

                bedsRowContainer.appendChild(bedRow);

                // Click letto
                lettoElement.addEventListener("click", (e) => {
                    datiForm.IDSetting = IDSetting;
                    const modale =e.currentTarget.dataset.modale ;
                        //generaFormDinamico(configurazioneForm, datiForm, 'formModale');
                        attivaModal(lettoElement.id, lettoElement.getAttribute("data-id-posto-letto"), lettoElement.getAttribute("data-i-d-setting",modale));
                    

                });
            });

            gancio.innerHTML = "";
            gancio.appendChild(bedsRowContainer);
        })
        .catch(error => console.error("Errore:", error));
}

function assegnaStato(IDStatoLetto, dataIngresso = null, dataPresuntoTrasferimento = null, dataTrasferimento = null, sesso = null, numeroStanza = null) {
    let statoLetto = null;
    let bgcolor = '#e0e0e0'; // default
    let icona = null;

    switch (IDStatoLetto) {
        case 13:
            // Stato
            statoLetto = 'O';
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
            statoLetto = 'MAN';
            // Codice eseguito se espressione === valore2
            bgcolor = 'red';
            break;
        case 3:
            statoLetto = 'CHIUSO';
            bgcolor = '#e0c4a7';
            break;
        case 14:
            statoLetto = 'LIBERO';
            bgcolor = 'lightgreen';
            break;

        default:
            // Codice eseguito se nessun case corrisponde
            statoLetto = null;
    }
    return [statoLetto, bgcolor, icona];
}


function toggleLetto(letto, reparto) {

    FormData.IDSetting = letto.dataset.IDSetting;
    attivaModal(letto.id, letto.dataset.idPostoLetto, letto.dataset.IDSetting,"modale");
    
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
    reparto.querySelector(".liberi").textContent = liberi;
    reparto.querySelector(".uomini").textContent = uomini;
    reparto.querySelector(".donne").textContent = donne;
}

// Esempio: creo 3 reparti
const dashboard = document.getElementById("dashboardReparti");

function attivaModal(idPostoLetto, idPostoLetto, IDSetting, modale) {
    
    // Seleziona il modale tramite il suo ID HTML   

    datiForm.IDSetting = IDSetting; // memorizzo l'ID del letto nell'oggetto dati
    datiForm.idPostoLetto = idPostoLetto; // memorizzo l'ID del letto nell'oggetto dati
    
    const params = {
        backdrop: 'static', // Impedisce la chiusura al click sullo sfondo nero
        keyboard: false     // Impedisce la chiusura premendo il tasto ESC
    };
    let mioModale=null;
    if(modale === 'modale'){
        const mioModaleHTML = document.getElementById("modalLetto");
        generaFormDinamico(configurazioneForm, datiForm, 'formModale');
        mioModale = new bootstrap.Modal(mioModaleHTML, params);
    }else{
         const mioModaleHTML = document.getElementById("modalLettoDx");
        generaFormDinamico(configurazioneFormDx, datiformDx, 'formModaleDx');
        mioModale = new bootstrap.Modal(mioModaleHTML, params);
    }
   

    mioModale.show();
}
function chiudiModal(modale = 'modalLetto') {
    const mioModaleHTML = document.getElementById(modale);
    const mioModale = bootstrap.Modal.getInstance(mioModaleHTML);
    mioModale.hide();
}



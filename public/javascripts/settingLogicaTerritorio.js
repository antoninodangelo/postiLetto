import { tabellaRicoverati } from "./creaTabellaRicoverati.js";
import { creaMenuSx } from "./gestisciMenuSx.js";
import { tabellaDimissioni } from "./tabellaDimissioni.js";
import { gestisciChiusure } from "./gestioneChiusure/gestisciChusuraLetti.js";
import { creaCardRepartoConLettiSVG } from "./dash/dashboard.js";
import { gestionePiano } from "./gestioneChiusure/gestionePiano.js";
import { tabellaPazientiGestiti } from "./tabellaPazientiGestiti.js"
import { gestisciFormSetting } from "./tabellaInsSetting.js";
import { tabellaBoarding } from "./tabellaBoarding.js";


let setting = [];
let settingUtente = [];
let settingsZona = [];
let livelloAccesso = 1;
let zonaUtente = 1;
let IDUtente = 1;
let IDSetting = null;
/// devo aggiustare iDSetting
fetch('/users/getUserData', { credentials: 'include' })
    .then(res => {
        if (!res.ok) {
            throw new Error("Errore nel recupero dei dati utente");
        }
        return res.json();
    })
    .then(async data => {
        if (!data || !data.IDUtente) {
            throw new Error("Dati utente non validi");
        }
        document.getElementById('nomeUtente').innerHTML = `${data.nome} ${data.cognome}`;
        IDUtente = data.IDUtente;
        livelloAccesso = data.IDPubblico;
        IDSetting = data.IDSetting;

        await caricaDati();

        creaMenuSx(
            livelloAccesso,
            "menuSx",
            data,
            caricaSetting,
            generaTabellaPazienti,
            settingUtente,
            gestisciChiusure,
            creaCardRepartoConLettiSVG,
            gestionePiano,
            generaTabellaLettiOccupati,
            tabellaPazientiGestiti,     // <── AGGIUNGI QUESTO
            gestisciFormSetting         // <── ORA È NELLA POSIZIONE GIUSTA
        );

    })
    .catch(err => {
        console.error("Errore durante il caricamento dei dati utente:", err);
        //window.location.href = "/login?error=1";   // 🔥 redirect automatico
    });


document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const res = await fetch('/logout', {
            method: 'POST',
            credentials: 'include' // invia il cookie di sessione
        });
        if (res.redirected) {
            window.location.href = res.url;
            return;
        }
        const data = await res.json();
        if (data.ok) {
            window.location.href = '/login';
        }

    } catch (err) {
        console.error('Errore nel logout:', err);
    }
});


const configurazioneFormPz = [

    {
        id: 'IDPostoLetto',
        label: 'ID Letto:',
        type: 'text',
        required: false,
        disabled: true
    },
    {
        id: 'nomePaziente',
        label: 'Nome:',
        type: 'text',
        required: true,
        disabled: false
    },
    {
        id: 'cognomePaziente',
        label: 'Cognome',
        type: 'text',
        required: true,
        disabled: false
    },
    {
        id: 'dataNascita',
        label: 'Data di nascita:',
        type: 'date',
        required: true,
        disabled: false
    },

    {
        id: 'sesso',
        label: 'Sesso',
        type: 'select',
        required: true,
        options: ['DONNA', 'UOMO'],
        values: [1, 2]
    },
    {
        id: 'zona',
        label: 'Zona',
        type: 'select',
        required: true,
        options: [],
        values: []
    },
    {
        id: 'settingApp',
        label: 'Setting Appartenenza',
        type: 'select',
        required: true,
        options: [],
        values: []
    },
    {
        id: 'problemiAperti',
        label: 'Problemi aperti',
        type: 'text',
        required: true,
        disabled: false
    }
];
const datiformPz = {
    IDPostoLetto: null,
    nomePaziente: null,
    cognomePaziente: null,
    dataNascita: null,
    sesso: null,
    zona: null,
    settingApp: null,
    settingDestinazione: null,
    dataTrasf: null,
    problemiAperti: null
};
const configurazioneForm = [
    {
        id: 'IDPostoLetto',
        label: 'ID Letto:',
        type: 'text',
        required: false,
        disabled: true,
        visibile: false
    },
    {
        id: 'IDSetting',
        label: 'ID Setting:',
        type: 'text',
        required: false,
        disabled: true,
        visibile: false
    },
    {
        id: 'IDStatoLetto',
        label: 'Stato Letto:',
        type: 'select',
        options: [],
        values: []
    },
    {
        id: 'IDTipoLetto',
        label: 'Tipo Letto',
        type: 'select',
        options: ['LETTO', 'BARELLA', 'POLTRONA'],
        values: [1, 2, 3]
    },
    {
        id: 'sessoPz',
        label: 'Sesso',
        type: 'select',
        options: ['DONNA', 'UOMO'],
        values: [1, 2]
    },
    {
        id: 'numeroStanza',
        label: 'Numero Stanza',
        type: 'select',
        options: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15],
        values: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15] // Valori corrispondenti da inviare al server
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
    },

];
configurazioneFormPz.formType = "updatePaziente";
configurazioneForm.formType = "updateLetto";


// 2. OGGETTO DI APPOGGIO DATI: Qui verranno salvati i valori inseriti dall'utente
let datiForm = {
    IDPostoLetto: 1,
    IDSetting: null,
    numeroLetto: 1,
    sessoPz: 1,
    IDStatoLetto: 1,
    IDTipoLetto: 1,
    numeroStanza: 1,
    note: ''
};



async function caricaDati() {
    await caricaSetting(IDUtente, livelloAccesso);
    await caricaSetting(IDUtente, livelloAccesso,7);
    caricaStatoLetti();
    caricaZona();
    generaTabellaPazienti(settingUtente, 'tabellaTrasf', livelloAccesso);
    //generaTabellaPazientiDimessi("7", IDUtente, livelloAccesso);
    if(livelloAccesso>=50){ 
       tabellaBoarding();
    } 

    generaTabellaPostiLiberi(IDUtente, 'tabellaTrasf', livelloAccesso);
    generaTabellaPostiChiusi(IDUtente, 'lettiChiusi', livelloAccesso);
    tabellaDimissioni("tabellaDimissioni", IDUtente, livelloAccesso, generaTabellaPostiLiberi, caricaSetting, settingUtente, generaTabellaPazienti);

    // tabellaRicoverati('tabellaRicoverati',livelloAccesso);
    caricaSettingAppartenenza();

}

function generaTabellaPostiLiberi(IDUtente, idDivAggancio, livelloAccesso) {

    fetch(`/territorio/numeroLettiLiberi/${IDUtente}/${livelloAccesso}`)
        .then(res => res.json())
        .then(dati => {
            const container = document.getElementById(idDivAggancio);

            if (!container) return console.error("Div non trovata:", idDivAggancio);
            //container.innerHTML = ""; // pulizia
            creaTabellaQuery(
                dati,

                [
                    { label: "N° Letti Liberi", key: "LETTI LIBERI" },
                    { label: "Setting", key: "SETTING" }
                ],
                idDivAggancio,
                "Posti Letto Liberi",
                "#009944"
            );
        });
}

function generaTabellaLettiOccupati(idDivAggancio, livelloAccesso) {
    fetch(`/territorio/lettiOccupatiGenerale/${livelloAccesso}`)
        .then(res => res.json())
        .then(dati => {
            const container = document.getElementById(idDivAggancio);

            if (!container) return console.error("Div non trovata:", idDivAggancio);
            //container.innerHTML = ""; // pulizia

            creaTabellaQuery(
                dati,
                [
                    { label: "#", key: "IDPaziente" },
                    { label: "Zona", key: "zona" },
                    { label: "Setting", key: "setting" },
                    { label: "Nome", key: "nome" },
                    { label: "N° Letto", key: "numeroLetto" }

                ],
                idDivAggancio,
                "Posti Letto Occupati",
                "#ec9f10"
            );
        });
}
/*   function generaTabellaPazientiDimessi(giorni, IDUtente, livelloAccesso) {
    const container = document.getElementById('tabellaRisultati');
    if (!container) return console.error("Div non trovata:", 'tabellaRisultati');
    if (container) {
        container.innerHTML = ""; // pulizia
    }
    fetch(`/pazientiDimessi/${giorni}/${IDUtente}/${livelloAccesso}`)
        .then(res => res.json())
        .then(dati => {
            creaTabellaQuery(
                dati,
                [
                    { label: "Sesso", key: "sesso" },
                    { label: "Totale", key: "totale" }
                ],
                "tabellaRisultati",
                `Pazienti trasferiti ultimi ${giorni} giorni`
            );
        });

}    */
function generaTabellaPostiChiusi(IDUtente, idDivAggancio, livelloAccesso) {

    fetch(`/numeroLettiChiusi/${IDUtente}/${livelloAccesso}`)
        .then(res => res.json())
        .then(dati => {

            const container = document.getElementById(idDivAggancio);

            if (!container) return console.error("Div non trovata:", idDivAggancio);
            container.innerHTML = ""; // pulizia
            creaTabellaQuery(
                dati,
                [
                    { label: "N° Letti Chiusi", key: "LETTI CHIUSI" },
                    { label: "Setting", key: "SETTING" }
                ],
                idDivAggancio,
                "Posti Letto Chiusi"
            );
        });
}
function creaTabellaQuery(dati, colonne, idAggancio, titolo = null, coloreHex = null) {

    const container = document.getElementById(idAggancio);
    if (!container) return console.error("Div non trovata:", idAggancio);

    //container.innerHTML = ""; // pulizia

    // Creo la tabella
    const table = document.createElement("table");
    table.className = "table table-striped table-bordered table-hover mb-3 small-table";



    // THEAD
    let thead = `<thead class="table-primary small-table-header">`;

    if (titolo) {
        thead += `
            <tr>
                <th colspan="${colonne.length}" class="text-center table-title">${titolo}</th>
            </tr>
        `;
    }

    thead += "<tr>";
    colonne.forEach(col => {
        thead += `<th class="small-cell">${col.label}</th>`;
    });
    thead += "</tr></thead>";

    table.innerHTML = thead + "<tbody></tbody>";

    const tbody = table.querySelector("tbody");

    // Righe
    dati.forEach(riga => {
        const tr = document.createElement("tr");

        colonne.forEach(col => {
            const td = document.createElement("td");
            td.className = "small-cell";
            td.textContent = riga[col.key] ?? "0";
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    container.appendChild(table);
    if (coloreHex !== null) {
        table.querySelectorAll("th").forEach(cell => {
            cell.style.backgroundColor = coloreHex;
        });
    }
}

/**
 * Crea una select HTML basata sui risultati di una query.
 *
 * @function creaSelectQuery
 * @description
 * Genera dinamicamente una select con etichetta, titolo opzionale e valori provenienti da una query.
 * Appende la select all'elemento HTML indicato tramite idAggancio.
 *
 * @param {string} label - Testo della label mostrata sopra la select.
 * @param {Array<{ testo: string, valore: any }>} valori - Array di oggetti contenenti testo visibile e valore da inviare.
 * @param {string} idSelect - ID univoco da assegnare alla select generata.
 * @param {string} idAggancio - ID del contenitore HTML dove appendere la select.
 * @param {string|null} [titolo=null] - Titolo opzionale da mostrare sopra la select.
 *
 * @returns {HTMLSelectElement} La select generata e già appendata al DOM.
 *
 * @example
 * // Esempio di utilizzo:
 * creaSelectQuery(
 *   "Stato Letto",
 *   [
 *     { testo: "Libero", valore: 14 },
 *     { testo: "Occupato", valore: 13 },
 *     { testo: "In Dimissione", valore: 15 }
 *   ],
 *   "selectStatoLetto",
 *   "contenitoreSelect",
 *   "Seleziona lo stato del letto"
 * );
 */
function creaSelectQuery(label, valori, idSelect, idAggancio, titolo = null) {

    // 1. Recupero il contenitore di aggancio
    const container = document.getElementById(idAggancio);
    if (!container) {
        console.error(`❌ Contenitore non trovato: ${idAggancio}`);
        return null;
    }

    // 2. Wrapper generale
    const wrapper = document.createElement("div");
    wrapper.className = "mb-3";

    // 3. Titolo opzionale
    if (titolo) {
        const h5 = document.createElement("h5");
        h5.innerText = titolo;
        wrapper.appendChild(h5);
    }

    // 4. Label
    const labelEl = document.createElement("label");
    labelEl.className = "form-label fw-bold";
    labelEl.innerText = label;
    labelEl.htmlFor = idSelect;
    wrapper.appendChild(labelEl);

    // 5. Select
    const select = document.createElement("select");
    select.id = idSelect;
    select.className = "form-select";

    // 6. Placeholder
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.innerText = "Seleziona...";
    select.appendChild(placeholder);

    // 7. Popolamento opzioni
    valori.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.valore;
        opt.innerText = v.testo;
        select.appendChild(opt);
    });

    // 8. Append finali
    wrapper.appendChild(select);
    container.appendChild(wrapper);

    return select;
}
/*
QUEST E LA TABELLA SOTTO I LETTI CHE PERMETTE LA GESTIONE DEI TRASFER
*/
async function generaTabellaPazienti(settings, idDivAggancio, livelloAccesso) {

    const container = document.getElementById(idDivAggancio);
    if (!container) return console.error("Div non trovata:", idDivAggancio);
    container.innerHTML = "";

    for (const settingID of settings) {

        const response = await fetch(`/territorio/pazientiPerSetting/${settingID}`);
        const pazienti = await response.json();

        const responseSetting = await fetch(`/territorio/getSettingDestinazione`);
        const settingData = await responseSetting.json();

        if (pazienti.length === 0) continue;

        const nomeSetting = pazienti[0].setting;
        const mostraDestinazione = livelloAccesso >= 50;

        // WRAPPER RESPONSIVE
        const wrapper = document.createElement("div");
        wrapper.className = "table-responsive";

        const table = document.createElement("table");
        table.className = "table table-striped table-bordered table-hover mb-4 align-middle table-compact";

        let colSetting = "";
        let colAzioneTrasf = '<th>dimetti</th>';
        if (livelloAccesso >= 50) colSetting = `<th>setting</th>`;
        if (livelloAccesso >= 50) colAzioneTrasf = `<th>trasferisci</th>`;

        table.innerHTML = `
            <thead class="table-primary">
                <tr>
                    <th colspan="${mostraDestinazione ? 9 : 6}" class="text-center">${nomeSetting}</th>
                </tr>
                <tr>
                    ${colSetting}
                    <th>Nome</th>
                    <th>Cognome</th>
                    <th>Data Nascita</th>
                    <th>Letto</th>
                    ${mostraDestinazione ? "<th>Setting destinazione</th><th>Letti Liberi</th>" : ""}
                    <th style="width:120px">Azioni</th>
                    ${colAzioneTrasf}
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        pazienti.forEach(async p => {

            let selectSetting = `<select id="selectSetting_${p.IDPaziente}" class="form-select form-select-sm">`;
            selectSetting += `<option value="0">Seleziona un valore...</option>`;
            settingData.forEach(s => {
                selectSetting += `<option value="${s.valore}">${s.testo}</option>`;
            });
            selectSetting += `</select>`;

            let selectLettiLiberi = `<select id="selectLettiLiberi_${p.IDPaziente}" class="form-select form-select-sm">`;
            selectLettiLiberi += `<option value="0">Seleziona un valore...</option>`;
            selectLettiLiberi += `</select>`;

            document.addEventListener('change', async (e) => {
                if (e.target.id === 'selectSetting_' + p.IDPaziente) {

                    const IDSettingLettiLiberi = e.target.value;
                    const td = e.target.closest("td");
                    const nextTd = td.nextElementSibling;
                    const select = nextTd.querySelector("select");

                    const risLettiLiberi = await fetch(`/territorio/lettiLiberiSetting/${IDSettingLettiLiberi}`);
                    const lettiLiberi = await risLettiLiberi.json();

                    let html = `<option value="0">Seleziona un valore...</option>`;
                    html += (lettiLiberi?.length > 0)
                        ? lettiLiberi.map(s => `<option value="${s.IDPostoLetto}">${s.numeroLetto}</option>`).join("")
                        : `<option value="" disabled>Nessun letto libero</option>`;

                    select.innerHTML = html;
                }
            });

            const tr = document.createElement("tr");
            tr.dataset.idPaziente = p.IDPaziente;
            tr.dataset.idPostoLetto = p.IDPostoLetto;
            tr.dataset.setting = p.setting;

            let colSettingTD = (livelloAccesso >= 50) ? `<td>${p.setting}</td>` : "";
            let colAzioneTrasfTD = (livelloAccesso >= 50)
                ? `<td><button class="btn btn-primary btn-sm w-100 btn-trasferisci">TRASFERISCI</button></td>`
                : `<td><button class="btn btn-primary btn-sm w-100 btn-dimetti">Dimetti</button></td>`;

            tr.innerHTML = `
                ${colSettingTD}
                <td>${p.nomePaziente}</td>
                <td>${p.cognomePaziente}</td>
                <td>${p.dataNascita}</td>
                <td>${p.numeroLetto}</td>
                ${mostraDestinazione ? `<td>${selectSetting}</td>` : ""}
                ${mostraDestinazione ? `<td>${selectLettiLiberi}</td>` : ""}
                <td class="text-center">
                    <button class="btn btn-danger btn-sm w-100 btn-cancella">Cancella</button>
                </td>
                ${colAzioneTrasfTD}
            `;

            tbody.appendChild(tr);
        });

        wrapper.appendChild(table);
        container.appendChild(wrapper);
    }
}
async function dimettiPaziente(IDPaziente, IDPostoLetto, livelloAccesso, IDUtente) {
    const responce = await fetch(`/territorio/dimettiPaziente/${IDPaziente}/${IDPostoLetto}/${livelloAccesso}/${IDUtente}`);
}
/*
 * ROUTINE: Genera il form e mappa i dati in tempo reale
 * @param {Array} config - L'array di configurazione dei campi
 * @param {Object} storage - L'oggetto dove salvare i dati inseriti
 * @param {string} idFormHTML - L'ID del form HTML di destinazione
 */
function generaFormDinamico(config, storage, idFormHTML) {
    const formElement = document.getElementById(idFormHTML);
    formElement.classList.add("form-compact");
    if (!formElement) return console.error("Form non trovato nell'HTML");
    formElement.innerHTML = ''; // Pulisce il form da vecchi elementi
    formElement.onsubmit = null;
    formElement.dataset.formType = config.formType;
    if (livelloAccesso === 1) {
        config = config.filter(el => el.id !== 'dataTrasf');
    }
    config.forEach(campo => {
        // Crea il contenitore del gruppo (form-group / mb-3)
        const wrapper = document.createElement('div');
        wrapper.className = 'mb-3 d-flex flex-column text-start';
        // Crea la Label
        const label = document.createElement('label');
        label.htmlFor = campo.id;
        label.className = 'form-label fw-bold mb-1';
        label.innerText = campo.label;
        if (campo.visibile === false) label.style.display = 'none';
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
            if (campo.required) input.required = true;
            if (campo.visibile === false) input.style.display = 'none';

        } else if (campo.type === 'textarea') {
            input = document.createElement('textarea');
            if (campo.placeholder) input.placeholder = campo.placeholder;
            input.rows = 3;
        } else if (campo.type === 'data') { }
        else {
            input = document.createElement('input');
            input.type = campo.type;
            if (campo.placeholder) input.placeholder = campo.placeholder;
            if (campo.required) input.required = true;
            if (campo.disabled) input.disabled = true;
            if (campo.visibile === false) input.style.display = 'none';
            storage[campo.id] = storage[campo.id] || ''; // Inizializza il valore nello storage se non presente
        }

        // Proprietà comuni a tutti i campi
        input.id = campo.id;
        input.className = 'form-control'; // Classe CSS standard (ottima per Bootstrap)


        // Sincronizza il valore iniziale dall'oggetto di appoggio

        input.value = storage[campo.id] ?? "";

        // EVENTO INPUT/CHANGE: Aggiorna l'oggetto di appoggio ad ogni digitazione

        input.addEventListener('change', e => {
            storage[campo.id] = e.target.value;
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
    formElement.onsubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = "";
            let nomeModale = "";
            let payload = storage;

            const tipoForm = formElement.dataset.formType;

            switch (tipoForm) {
                case "updateLetto":
                    endpoint = "/territorio/salvaDatiLetto";
                    nomeModale = 'modalLetto';
                    break;

                case "updatePaziente":
                    endpoint = `/territorio/salvaDatiPaziente/${livelloAccesso}`;
                    nomeModale = 'insPaziente';
                    break;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            await caricaSetting(IDUtente, livelloAccesso);
            await caricaSetting(IDUtente, livelloAccesso,7);
            chiudiModal(nomeModale);
            generaTabellaPazienti(settingUtente, "tabellaTrasf", livelloAccesso);
            //generaTabellaPazientiDimessi("7", IDUtente, livelloAccesso);
            generaTabellaPostiLiberi(IDUtente, 'tabellaTrasf', livelloAccesso);
            generaTabellaPostiChiusi(IDUtente, 'lettiChiusi');


        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
        }
    };

}
async function caricaSetting(IDUtente, livelloAccesso, idSetting = null) {
    try {
        const response = await fetch(`/territorio/settingUtente/${IDUtente}/${livelloAccesso}`);
let reparto = await response.json();

let gancioBoarding = 'dashboardReparti';
let repartoBoarding = null;
// Se è richiesto il boarding, filtra
if (idSetting !== null && idSetting !== undefined) {
    repartoBoarding = reparto.filter(r => r.IDSetting === 7);
     gancioBoarding = 'boarding';
}else{
     repartoBoarding = reparto.filter(r => r.IDSetting !== 7);
    }
    reparto = repartoBoarding;
    console.log('reparto boarding', reparto);
const aggancio = document.getElementById(gancioBoarding);
if (!aggancio) {
    console.error("Elemento non trovato:", gancioBoarding);
    return;
}

aggancio.innerHTML = "";


        // Lista IDSetting senza duplicati
        settingUtente = [...new Set(reparto.map(s => s.IDSetting))];

        // Raggruppamento per azienda
        const aziendeMap = new Map();

        reparto.forEach(setting => {
            const nomeAzienda = setting.nomeAzienda || "Senza azienda";

            if (!aziendeMap.has(nomeAzienda)) {
                const aziendaBox = document.createElement('div');
                aziendaBox.className = "riquadro-azienda";
                aziendaBox.style.background = "#f2f2f2";
                aziendaBox.style.padding = "10px";
                aziendaBox.style.marginBottom = "15px";
                aziendaBox.style.borderRadius = "6px";
                aziendaBox.style.border = "1px solid #ccc";

                const titolo = document.createElement('h6');
                titolo.textContent = nomeAzienda;
                titolo.style.marginBottom = "8px";
                aziendaBox.appendChild(titolo);
                aziendeMap.set(nomeAzienda, aziendaBox);
                aggancio.appendChild(aziendaBox);
            }

            const boxAzienda = aziendeMap.get(nomeAzienda);

            boxAzienda.appendChild(
                creaReparto(setting.setting, setting.IDSetting, livelloAccesso, nomeAzienda)
            );
        });

    } catch (error) {
        console.error('Errore nella routine caricasetting:', error);
    }
}



async function caricaSettingAppartenenza(idZona = 0) {
    try {
        const response = await fetch(`/territorio/settingAppartenenza/${idZona}`);
        const setting = await response.json();
        if (setting.length !== 0) {

            configurazioneFormPz.find(el => el.id === 'settingApp').options = setting.map(s => s.setting);
            configurazioneFormPz.find(el => el.id === 'settingApp').values = setting.map(s => s.IDSetting);


        }


    } catch (error) {
        console.error('Errore nella routine caricasetting:', error);
    }
}
async function caricaZona() {
    try {
        const response = await fetch(`/territorio/caricaZona`);
        const azienda = await response.json();

        // 🔥 Popolo settingUtente SENZA duplicati
        configurazioneFormPz.find(el => el.id === 'zona').options = azienda.map(s => s.testo);
        configurazioneFormPz.find(el => el.id === 'zona').values = azienda.map(s => s.valore);


    } catch (error) {
        console.error('Errore nella routine caricasetting:', error);
    }
}

async function caricaStatoLetti() {
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

const modalPaziente = new bootstrap.Modal(document.getElementById("insPaziente"));
const modalBody = document.getElementById("modalBodyInsPaziente");
const modalAlert = new bootstrap.Modal(document.getElementById("alert"));
const modalAlertBody = document.getElementById("modalBodyAlert");

window.assegnaPaziente = function assegnaPaziente(event, IDPostoLetto, IDSetting) {
    event.stopPropagation();

    datiformPz.IDPostoLetto = IDPostoLetto;
    datiformPz.IDSetting = IDSetting;

    generaFormDinamico(configurazioneFormPz, datiformPz, 'formInsPaziente');

    attivaModal(null, IDPostoLetto, IDSetting, 'insPaziente');
};


function creaReparto(nome, IDSetting, livelloAccesso, nomeStruttura) {

    const reparto = document.createElement("div");
    reparto.className = "reparto";
    nomeStruttura = nomeStruttura || nome;

    let contatoreUomini = 0;
    let contatoreDonne = 0;

    let containerLettiDx = (IDSetting === 7) ? "letti-container-dx" : "letti-container";

    const pulsantiLetto = livelloAccesso >= 50 ? `
        <svg width="20" height="20" viewBox="0 0 20 20"
             class="piu svg-button" data-id-setting="${IDSetting}">
            <g transform="scale(1.4)">
                <rect x="0.5" y="0.5" width="19" height="19"
                      fill="none" rx="3" stroke="#000" stroke-width="1"/>
                <g transform="translate(10,10)">
                    <circle cx="0" cy="0" r="4" fill="#000"/>
                    <line x1="-2" y1="0" x2="2" y2="0"
                          stroke="#fff" stroke-width="1"/>
                    <line x1="0" y1="-2" x2="0" y2="2"
                          stroke="#fff" stroke-width="1"/>
                </g>
            </g>
        </svg>

        <svg width="20" height="20" viewBox="0 0 20 20"
             class="meno svg-button" data-id-setting="${IDSetting}">
            <g transform="scale(1.4)">
                <rect x="0.5" y="0.5" width="19" height="19"
                      fill="none" rx="3" stroke="#000" stroke-width="1"/>
                <g transform="translate(10,10)">
                    <circle cx="0" cy="0" r="4" fill="#000"/>
                    <line x1="-2" y1="0" x2="2" y2="0"
                          stroke="#fff" stroke-width="1"/>
                </g>
            </g>
        </svg>
    ` : "";

    reparto.innerHTML = `
        <h6>${nome}</h6>
        <div class="${containerLettiDx}"></div>
        ${pulsantiLetto}
        <div id="contatori-${IDSetting}">
            posti letto liberi : 0 uomini, 0 donne
        </div>
    `;

    const containerLetti = reparto.querySelector(`.${containerLettiDx}`);
    const contatoriDiv = reparto.querySelector(`#contatori-${IDSetting}`);

    // Carica letti (sincrono dal punto di vista della funzione: fetch è async ma non cambia il return)
    fetch(`/territorio/letti/${IDSetting}`)
        .then(r => r.json())
        .then(data => {
            contatoreDonne = 0;
            contatoreUomini = 0;

            const fragment = document.createDocumentFragment();

            data.forEach(letto => {
                const { statoLetto, bgcolor, icona, labelStato } = assegnaStato(
                    letto.IDStatoLetto,
                    letto.dataInserimento,
                    letto.dataTrafPrevista,
                    letto.dataTrasf,
                    letto.sessoPz,
                    letto.numeroStanza,
                    livelloAccesso
                );

                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("viewBox", "0 0 50 50");
                svg.setAttribute("width", "50");
                svg.setAttribute("height", "50");

                svg.dataset.IDPostoLetto = letto.IDPostoLetto;
                svg.dataset.IDSetting = IDSetting;

                svg.style.setProperty("--bg-letto-dinamico", bgcolor || "#e0e0e0");

                let sessoLetto = letto.sessoPz || "";
                if (sessoLetto === 1) {
                    sessoLetto = "F";
                    svg.style.setProperty("--bg-letto-dinamico", "#ff4fa3");
                } else if (sessoLetto === 2) {
                    sessoLetto = "M";
                    svg.style.setProperty("--bg-letto-dinamico", "#5653de");
                }

                if (sessoLetto === "F" && letto.IDPaziente === null) contatoreDonne++;
                if (sessoLetto === "M" && letto.IDPaziente === null) contatoreUomini++;

                svg.innerHTML = `
                    <g class="gestisciLetto">
                        <text x="25" y="10" font-size="11" font-weight="600"
                              text-anchor="middle" fill="#000">${sessoLetto}</text>

                        <text x="25" y="18" font-size="9" font-weight="700"
                              text-anchor="middle" fill="#222">
                            L${letto.numeroLetto || ""}/S${letto.numeroStanza || ""}
                        </text>

                        <rect x="14" y="22" width="12" height="4"
                              rx="2" fill="var(--bg-letto-dinamico)"></rect>

                        <rect x="14" y="29" width="22" height="6"
                              rx="3" fill="var(--bg-letto-dinamico)"></rect>

                        <text x="25" y="48" font-size="12" font-weight="800"
                              text-anchor="middle" fill="#333" class="assegnaPz">
                            ${statoLetto}
                        </text>

                        <text x="25" y="55" font-size="6" font-weight="800"
                              text-anchor="middle" fill="#555">
                            ${labelStato}
                        </text>
                    </g>
                `;

                fragment.appendChild(svg);

                svg.querySelector(".gestisciLetto").addEventListener("click", (event) => {
                    event.stopPropagation();
                    attivaModal(null, letto.IDPostoLetto, IDSetting, "modale");
                });

                svg.querySelector(".assegnaPz").addEventListener("click", (event) => {
                    event.stopPropagation();
                    assegnaPaziente(event, letto.IDPostoLetto, IDSetting);
                });
            });

            containerLetti.appendChild(fragment);

            contatoriDiv.innerText =
                `posti letto liberi : ${contatoreUomini} uomini, ${contatoreDonne} donne`;

            aggiornaContatori(reparto);
        })
        .catch(err => console.error("Errore nella routine caricasetting:", err));

    // IMPORTANTISSIMO: ritorna SUBITO un Node, non una Promise
    return reparto;
}




function assegnaStato(
    IDStatoLetto,
    dataIngresso = null,
    dataPresuntoTrasferimento = null,
    dataTrasferimento = null,
    sesso = null,
    numeroStanza = null,
    livelloAccesso
) {
    let statoLetto = null;
    let labelStato = "---";
    let bgcolor = "#e0e0e0";
    let icona = "";

    const haDateTrasferimento = (dataPresuntoTrasferimento !== null || dataTrasferimento !== null);

    // -------------------------
    // Funzioni icona SVG
    // -------------------------
    const svgPersona = (colore, label) => `
        <text x="14" y="6" font-size="6" font-weight="bold" text-anchor="middle" fill="#000">
            ${numeroStanza || ""}
        </text>

        <g transform="translate(6, 10) scale(0.6)" fill="${colore}">
            <path d="M14 5a2 2 0 1 1-4 0a2 2 0 0 1 4 0Z"/>
            <path d="M10 7c-.5 2 3.5 2 3 0c-.3-1.5-2.7-1.5-3 0Z"/>
            <path d="M9 22H7l2-7-3-2 1.5-2L11 14l2-4 3 1-2 5 2 6h-2l-1.5-4L11 18l-2 4Z"/>
        </g>

        <text x="14" y="32" font-size="7" font-weight="bold" text-anchor="middle" fill="#333">
            ${label}
        </text>
    `;

    const iconaDonna = (label) => svgPersona("#ff4fa3", label);
    const iconaUomo = (label) => svgPersona("#5653de", label);

    // -------------------------
    // SWITCH STATO
    // -------------------------
    switch (IDStatoLetto) {

        case 15: // PRE-DIMISSIONE
            statoLetto = "P";
            labelStato = (livelloAccesso >= 50) ? "Assegna" : "In Dim.";

            if (haDateTrasferimento) {
                bgcolor = "purple";
                icona = (sesso === 1) ? iconaDonna(labelStato) : iconaUomo(labelStato);
            } else {
                bgcolor = (sesso === 1) ? "pink" : "lightblue";
                labelStato = "---";
                icona = "";
            }
            break;

        case 2: // CHIUSO
            statoLetto = "CHUSO";
            bgcolor = "red";
            break;

        case 3: // CHIUSO ES
            statoLetto = "CHIUSO ES";
            labelStato = "CLOSE";
            bgcolor = "#e0c4a7";
            break;

        case 14: // LIBERO
            statoLetto = "LIBERO";
            bgcolor = "lightgreen";
            break;

        case 16: // OCCUPATO (DIMISSIONE)
            statoLetto = "Occ.";
            bgcolor = "yellow";
            break;

        default:
            statoLetto = null;
    }

    return { statoLetto, bgcolor, icona, labelStato };
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
document.addEventListener('click', async (e) => {

    const btnPiu = e.target.closest('.piu');
    const btnMeno = e.target.closest('.meno');

    if (btnPiu) {
        /// devo cambiare 1 con l' setting

        const response = await fetch(`/aggiuntaBoarding/${btnPiu.dataset.idSetting}`);
        if (!response.ok) throw new Error("non ho ricevuto i dati del letto");

        const dati = await response.json();

        await caricaSetting(IDUtente, livelloAccesso);
        await caricaSetting(IDUtente, livelloAccesso,7);
    }

    if (btnMeno) {

        try {
            const response = await fetch(`/sottraiBoarding/${btnMeno.dataset.idSetting}`);

            if (!response.ok) {
                alert("Errore HTTP: " + response.status);
                return;
            }

            const dati = await response.json();

            if (dati.error) {
                alert(dati.error);
                return;
            }

            await caricaSetting(IDUtente, livelloAccesso);
            await caricaSetting(IDUtente, livelloAccesso,7);

        } catch (err) {
            console.error(err);
            alert("Errore di comunicazione col server");
        }


        return;
    }
    if (e.target.classList.contains('btn-cancella')) {
        const tr = e.target.closest('tr');
        const idPostoLetto = tr.dataset.idPostoLetto;
        const idPaziente = tr.dataset.idPaziente;
        const controllo = confirm("SEI SICURO DI VOLER CANCELLARE IL PAZIENTE?");
        if (controllo) {
            await fetch(`/territorio/cancellaInserimento/${idPaziente}/${idPostoLetto}`);
            //////////////DEVO INSERIRE LE FUNZIONI CHE CARICANO I LETTI E IL RESTO//////////
            await caricaSetting(IDUtente, livelloAccesso);
            await caricaSetting(IDUtente, livelloAccesso,7);
            caricaStatoLetti();
            caricaZona();
            generaTabellaPazienti(settingUtente, 'tabellaTrasf', livelloAccesso);
            generaTabellaPostiLiberi(IDUtente, 'tabellaTrasf', livelloAccesso);
        }
        else {
            alert('CANELLAZIONE ANNULLATA');
            return;
        }
    }

    if (e.target.classList.contains('btn-dimetti')) {
        const tr = e.target.closest('tr');
        const idPostoLetto = tr.dataset.idPostoLetto;
        const idPaziente = tr.dataset.idPaziente;
        const controllo = confirm("SEI SICURO DI VOLER ANNULLARE LA DIMISSIONE?");
        if (controllo) {
            await fetch(`/territorio/dimettiPaziente/${idPaziente}/${idPostoLetto}/${livelloAccesso}/${IDUtente}`);
            //////////////DEVO INSERIRE LE FUNZIONI CHE CARICANO I LETTI E IL RESTO//////////
            await caricaSetting(IDUtente, livelloAccesso);
            await caricaSetting(IDUtente, livelloAccesso,7);
            caricaStatoLetti();
            caricaZona();
            generaTabellaPazienti(settingUtente, 'tabellaTrasf', livelloAccesso);
            generaTabellaPostiLiberi(IDUtente, 'tabellaTrasf', livelloAccesso);
        }
        else {
            alert('DIMISSIONE ANNULLATA');
            return;
        }
    }


    if (e.target.classList.contains('btn-trasferisci')) {
        const tr = e.target.closest('tr');
        const idPostoLetto = tr.dataset.idPostoLetto;
        const idPaziente = tr.dataset.idPaziente;
        const idLettoDestinazione = parseInt(document.getElementById("selectLettiLiberi_" + idPaziente).value, 10);

        const idSettigDestinazione = document.getElementById("selectSetting_" + idPaziente).value;
        if (idLettoDestinazione === 0 || idLettoDestinazione === undefined) {
            alert('DEVI SELZIONARE UN LETTO DI DESTINAZIONE');
            return;
        }

        const controllo = confirm("SEI SICURO DI VOLER TRASFERIRE IL PAZIENTE?");
        if (controllo) {
            await fetch(`/territorio/aggiornaDataTrasf/${idPaziente}/${idLettoDestinazione}/${IDUtente}/${idPostoLetto}/${idSettigDestinazione}`);
            await caricaSetting(IDUtente, livelloAccesso);
            await caricaSetting(IDUtente, livelloAccesso,7);
            caricaStatoLetti();
            caricaZona();
            generaTabellaPazienti(settingUtente, 'tabellaTrasf', livelloAccesso);
            generaTabellaPostiLiberi(IDUtente, 'tabellaTrasf', livelloAccesso);
            tabellaDimissioni("tabellaDimissioni", IDUtente, livelloAccesso, generaTabellaPostiLiberi, caricaSetting, settingUtente, generaTabellaPazienti);
            
        }
        else {
            alert('TRASFERIMENTO ANNULLATO');
            return;
        }
    }

});
function aggiornaContatori(reparto) {
    const liberi = reparto.querySelectorAll(".letto.libero").length;
    const uomini = reparto.querySelectorAll(".letto.occupato-uomo").length;
    const donne = reparto.querySelectorAll(".letto.occupato-donna").length;

}

const dashboard = document.getElementById("dashboardReparti");


window.attivaModal = function (event, IDPostoLetto, IDSetting, tipoModale) {

    // 🔥 NON bloccare Bootstrap se event è null
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    const params = {
        backdrop: 'static',
        keyboard: false
    };

    let mioModale;

    if (tipoModale === 'modale') {
        const html = document.getElementById("modalLetto");
        generaFormDinamico(configurazioneForm, datiForm, 'formModale');
        mioModale = new bootstrap.Modal(html, params);
        mioModale.show();
        return;
    }

    if (tipoModale === 'alert') {
        const html = document.getElementById("alert");
        mioModale = new bootstrap.Modal(html, params);
        mioModale.show();
        return;
    }

    // 🔥 INSERIMENTO PAZIENTE
    const html = document.getElementById("insPaziente");
    generaFormDinamico(configurazioneFormPz, datiformPz, 'formInsPaziente'); // 🔥 CORRETTO
    mioModale = new bootstrap.Modal(html, params);
    mioModale.show();
}

// 2) Funzione di chiusura resa sicura
function chiudiModal(idModale) {
    // Se non passi l'ID, cerchiamo di capire quale dei due modali è visibile


    const mioModaleHTML = document.getElementById(idModale);

    if (mioModaleHTML) {
        const mioModale = bootstrap.Modal.getInstance(mioModaleHTML);
        if (mioModale) {
            mioModale.hide();
        }
    }

    // FORZATURA DI SICUREZZA: Rimuove i residui grigi di Bootstrap se rimangono bloccati
    setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }, 300); // Attende la fine dell'animazione CSS di chiusura
}
document.addEventListener('change', async (e) => {
    try {
        const settingAzienda = await fetch(`/territorio/settingAppartenenza/${e.target.value}`);
        if (!settingAzienda.ok) throw new Error('Errore nella risposta del server');

        const dati = await settingAzienda.json();
        if (e.target.id === 'zona') {

            configurazioneFormPz.find(el => el.id === 'settingApp').options =
                dati.map(s => s.setting);
            configurazioneFormPz.find(el => el.id === 'settingApp').values =
                dati.map(s => s.IDSetting);
            creaSelect('settingApp');
        }
        if (e.target.id === 'settingApp') {
            datiformPz.IDSetting = e.target.value;

        }
    } catch (error) {
        console.error("Errore durante la fetch:", error);
    }
})
function creaSelect(gancio) {
    const campo = configurazioneFormPz.find(el => el.id === gancio);
    const input = document.getElementById(gancio);
    input.innerHTML = "";
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Seleziona un'opzione";
    input.appendChild(defaultOption);
    campo.options.forEach((opzione, index) => {
        const opt = document.createElement('option');
        opt.value = campo.values ? campo.values[index] : opzione;
        opt.innerText = opzione;
        if (campo.value == opt.value) opt.selected = true;

        input.appendChild(opt);
    });
}

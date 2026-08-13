

async function gestionePiano(dashboardReparti, livelloAccesso,nuovoSetting,IDZona) {
    let getDataStorico = null;
    let dettaglio = null;
    let setting = null;
    let dataStoricoArray=null;
    console.log(IDZona,"ID DELLA ZONA");
    document.getElementById("dashboardReparti").innerHTML = "";

    const formConfigStorico = [
        { id: 'numLettiChiusi', label: 'N° letti chiusi:', type: 'text', required: true, disabled: false },
        { id: 'dataChiusura', label: 'Data chiusura:', type: 'date', required: true, disabled: false },
        { id: 'nota', label: 'Nota:', type: 'text', required: false, disabled: false }
    ];

    const formConfigDettaglioStorico = [
        { id: 'numLettiChiusi', label: 'N° letti chiusi:', type: 'number', required: true, disabled: false },
        { id: 'dataInizioChiusura', label: 'Data Inizio Chiusura:', type: 'date', required: true, disabled: false },
        { id: 'dataFineChiusura', label: 'Data Fine Chiusura:', type: 'date', required: true, disabled: false },
        { id: 'nota', label: 'Nota:', type: 'text', required: false, disabled: false }
    ];

    try {
       
        const promises = [
            fetch('/getStoricoChiusure').then(r => r.json()),
            fetch('/getDettaglioStoricoChiusure').then(r => r.json())
        ];

        // aggiungo la terza fetch SOLO se nuovoSetting esiste
        if (nuovoSetting) {
            promises.push(
                fetch(`/setting/${IDZona}`).then(r => r.json())   /// devo inserire la zona di appartenenza             
            );
        }
        [getDataStorico, dettaglio, setting] = await Promise.all(promises);    
           
        if (nuovoSetting) getDataStorico = [nuovoSetting];
       console.log(getDataStorico);
        dataStoricoArray = getDataStorico.map(el => ({
        ID: el.IDStorico,
        IDSetting: el.IDSetting,
        setting: el.setting,
        numLettiChiusi: el.numLettiChiusi,
        dataChiusura: formatDateForInput(el.dataChiusura),
        nota: el.note
        
        }));

        const options = [];
        const values = [];
        if (setting) {
            setting.forEach(el => {
                options.push(el.setting);
                values.push(el.IDSetting)
            })

            const selectPerFormStorico = {
                id: 'IDSetting',
                label: 'Seleziona Setting',
                type: 'select',
                options: options,
                values: values
            }
            formConfigStorico.unshift(selectPerFormStorico)
            
        }
        
    } catch (err) {
        console.error("Errore nel caricamento:", err);
    }
    

    const dataDettaglioStoricoArray = dettaglio.map(el => ({
        IDDettaglioStorico: el.IDDettaglioSetting,
        IDStoricoChiusura: el.IDStoricoChiusura,
        numLettiChiusi: el.numPostiChiusiFerie,
        dataInizioChiusura: formatDateForInput(el.dataInizioChiusura),
        dataFineChiusura: formatDateForInput(el.dataFineChiusura),
        nota: el.nota,
        attivo: 1
    }));

    dataStoricoArray.forEach((det, indice) => {

        // CARD PRINCIPALE
        if (indice === 0) {
            const card = document.createElement('div');
            card.className = 'card mb-3 p-3 shadow-sm';
            card.style.backgroundColor = '#f3e5ab';
            const btnNuovo = document.createElement('button');
            btnNuovo.type = 'button';
            btnNuovo.className = 'btn btn-primary btn-submit ms-2';
            btnNuovo.innerText = 'Nuova chiusura';
            card.appendChild(btnNuovo);
            document.getElementById("dashboardReparti").append(card)
            btnNuovo.addEventListener('click', e => {
                e.preventDefault();
                const nuovoSetting = {
                    ID: null,
                    IDSetting: "",
                    setting: "",
                    numLettiChiusi: "",
                    dataChiusura: "",
                    nota: "",
                    IDZona: det.IDZona
                };
                
                gestionePiano(dashboardReparti, livelloAccesso, nuovoSetting, IDZona);
            });
        }
        const card = document.createElement('div');
        card.className = 'card mb-3 p-3 shadow-sm';
        card.style.backgroundColor = '#f3e5ab';

        const cardbody = document.createElement('div');
        cardbody.className = 'card-body';

        const titolo = document.createElement('h5');
        titolo.className = 'card-title';
        titolo.innerText = det.setting;

        cardbody.appendChild(titolo);

        // FORM STORICO
        const form = document.createElement('form');
        form.id = `formStorico_${det.IDSetting}`;

        const contenitoreForm = document.createElement('div');
        contenitoreForm.appendChild(form);

        cardbody.appendChild(contenitoreForm);
        card.appendChild(cardbody);

        document.getElementById('dashboardReparti').appendChild(card);

        // CORRETTO: passo il form, non la card
        generaFormDinamico(formConfigStorico, det, form, livelloAccesso, dataStoricoArray);

        // DETTAGLI
        const dettagli = dataDettaglioStoricoArray.filter(d => d.IDStoricoChiusura === det.ID);

        dettagli.forEach(element => {
            const dettaglioCard = document.createElement('div');
            dettaglioCard.className = 'card mb-3 p-3 shadow-sm bg-light';

            card.appendChild(dettaglioCard);

            generaFormDinamico(formConfigDettaglioStorico, element, dettaglioCard, livelloAccesso, dataDettaglioStoricoArray);
        });
    });
}



function generaFormDinamico(config, storage, formElement, livelloAccesso, arrayOrigine) {

    if (!formElement) return console.error("Form non trovato nell'HTML");

    formElement.classList.add('form-reparto-compact');

    config.forEach(campo => {

        const wrapper = document.createElement('div');
        wrapper.className = 'form-row';

        const left = document.createElement('div');
        left.className = 'form-left';

        const label = document.createElement('label');
        const uniqueId = `${campo.id}_${storage.IDDettaglioStorico || storage.ID}`;
        label.htmlFor = uniqueId;
        label.className = 'form-label';
        label.innerText = campo.label;

        let input;

        if (campo.type === 'select') {
            input = document.createElement('select');
            campo.options.forEach(opzione => {
                const opt = document.createElement('option');
                opt.value = opzione;
                opt.innerText = opzione;
                if (storage[campo.id] == opt.value) opt.selected = true;
                input.appendChild(opt);
            });
        } else if (campo.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 3;
        } else {
            input = document.createElement('input');
            input.type = campo.type;
        }

        input.id = uniqueId;
        input.className = 'form-control';
        input.required = campo.required;
        input.disabled = campo.disabled;
        input.value = storage[campo.id] ?? "";

        ['input', 'change'].forEach(ev => {
            input.addEventListener(ev, e => {
                storage[campo.id] = e.target.value;
            });
        });

        left.appendChild(label);
        left.appendChild(input);

        const right = document.createElement('div');
        right.className = 'form-right';

        if (campo.id === 'nota') {
            const btnInvia = document.createElement('button');
            btnInvia.type = 'button';
            btnInvia.className = 'btn btn-primary btn-submit';
            btnInvia.innerText = 'Salva';


           btnInvia.addEventListener('click', e => {
    const form = document.querySelector('#formStorico_');
            
    // Validazione HTML5
    if (!form.reportValidity()) return;

    // Triggera il submit vero
    form.requestSubmit();

    console.log("Salvataggio:", storage);
});




            right.appendChild(btnInvia);

        }

        wrapper.appendChild(left);
        wrapper.appendChild(right);

        formElement.appendChild(wrapper);
    });
}

function formatDateForInput(dbDate) {
    if (!dbDate) return "";

    // Normalizza formato MySQL
    const normalized = dbDate.replace(" ", "T");

    const d = new Date(normalized);

    if (isNaN(d.getTime())) {
        console.warn("Data non valida:", dbDate);
        return "";
    }

    return d.toISOString().split("T")[0]; // YYYY-MM-DD
}


export { gestionePiano };

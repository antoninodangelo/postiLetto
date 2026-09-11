async function gestisciFormSetting(gancio, IDUtente, livelloAccesso, formType) {
    
    const formElement = document.createElement('div');
    formElement.id = gancio;
   
    if (!formElement) console.error("Form non trovato nell'HTML");
    formElement.innerHTML = '';

    // -----------------------------
    // CONFIGURAZIONE CAMPI FORM
    // -----------------------------
    const campiForm = [
        { id: 'IDZona', label: 'ID Zona', type: 'select', options: [], values: [], required: false },
        { id: 'setting', label: 'Nome Setting', type: 'text', required: false },
        { id: 'coordinatore', label: 'Coordinatore', type: 'text' },
        { id: 'telefono', label: 'Telefono', type: 'text', required: false },
        { id: 'telefono1', label: 'Secondo Telefono', type: 'text', required: false },
        { id: 'zona', label: 'Zona', type: 'text', required: false },
        { id: 'dataIns', label: 'Data Inserimento', type: 'date', required: false },
        { id: 'numLetti', label: 'Numero di Letti', type: 'text', required: false },
        { id: 'numeroLettiChiusuraEsitva', label: 'Numero di Letti Chiusura Esitva', type: 'text', required: false },
        { id: 'ordine', label: 'Ordine di presentazione', type: 'select', options: [], values: [], required: false },
        { id: 'attivo', label: 'Attivo', type: 'select', options: ['Attivo', 'Non Attivo'], values: ['1', '0'], required: false },
        { id: 'note', label: 'Note', type: 'textarea' }
    ];

    // -----------------------------
    // STORAGE DATI
    // -----------------------------
    const storage = Object.fromEntries(
        campiForm.map(c => [c.id, ""])
    );
    const settings = await fetch('/territorio/getSetting')
        .then(res => res.json())
        .then(data => { return data; })
        .catch(err => {
            console.error("Errore nel recupero dei dati per il form:", err);
            return [];
        });
    console.log("settings iniziale:", settings);


        // Popolo le opzioni della select "ordine"
    // carico i dati dal server per popolare la selct del form
    fetch('/territorio/getZone')
        .then(res => res.json())
        .then(data => {
            // Popolo le opzioni della select "IDZona" e "zona"
            const idZonaCampo = campiForm.find(c => c.id === 'IDZona');
            idZonaCampo.options = data.map(z => z.zona);
            idZonaCampo.values = data.map(z => z.IDZona);
            
       
            // Popolo lo storage con i dati ricevuti
            /* Object.keys(storage).forEach(key => {
                if (data[key]) {
                    storage[key] = data[key];
                }
            }); */
           
          generaFormDinamico(campiForm, storage, formType, gancio);
        })
        .catch(err => {
            console.error("Errore nel recupero dei dati per il form:", err);
        });
    // -----------------------------
    // GENERATORE FORM DINAMICO
    // -----------------------------
    function generaFormDinamico(config, storage, formType, idFormHTML) {

    const container = document.getElementById(idFormHTML);
    if (!container) return console.error("Form non trovato nell'HTML");

    container.innerHTML = '';

    // Creo il vero form
    const form = document.createElement('form');
    form.dataset.formType = formType;

    config.forEach(campo => {

        const wrapper = document.createElement('div');
        wrapper.className = 'mb-3';

        const label = document.createElement('label');
        label.htmlFor = campo.id;
        label.className = 'form-label fw-bold mb-1';
        label.innerText = campo.label;

        let input;

        switch (campo.type) {
            case 'select':
                input = document.createElement('select');

                campo.options.forEach((opzione, index) => {
                    const opt = document.createElement('option');

                    opt.value = typeof opzione === 'object'
                        ? opzione.value
                        : campo.values?.[index] ?? opzione;

                    opt.innerText = typeof opzione === 'object'
                        ? opzione.text
                        : opzione;

                    if (storage[campo.id] == opt.value) opt.selected = true;

                    input.appendChild(opt);
                });

                input.addEventListener('change', e => {
                    storage[campo.id] = e.target.value;
                });

                break;

            case 'textarea':
                input = document.createElement('textarea');
                input.rows = 3;
                break;

            case 'date':
                input = document.createElement('input');
                input.type = 'date';
                break;

            default:
                input = document.createElement('input');
                input.type = campo.type;
                break;
        }

        input.id = campo.id;
        input.className = 'form-control';
        if (campo.required) input.required = true;
        input.value = storage[campo.id] ?? "";

        input.addEventListener('input', e => {
            storage[campo.id] = e.target.value;
        });

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        form.appendChild(wrapper);
    });

    // Bottone submit
    const btnInvia = document.createElement('button');
    btnInvia.type = 'submit';
    btnInvia.className = 'btn btn-primary mt-2 w-100';
    btnInvia.innerText = 'Salva Dati';
    form.appendChild(btnInvia);

    // Listener submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const tipoForm = form.dataset.formType;
        const payload = { ...storage };

        console.log("Dati da inviare al server:", payload);

        let endpoint = tipoForm === "updateSetting"
            ? "/territorio/modificaZona"
            : "/territorio/salvaZona";

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Risposta server:", data);
    });

    container.appendChild(form);    
    const divTabella = document.createElement('div');
    divTabella.id = 'tabellaInsSetting';
    divTabella.className = 'mt-4';
    divTabella.innerHTML = `<h3 class="text-center mb-3">Tabella Impostazioni</h3>
        <div class="table-responsive">
            <table class="table table-striped table-bordered" id="tabellaImpostazioni">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Valore</th>
                    </tr>
                </thead>
                <tbody id="tabellaImpostazioniBody">
                </tbody>
            </table>
        </div>
    </div>`;
    container.appendChild(divTabella);

}

}

export { gestisciFormSetting };
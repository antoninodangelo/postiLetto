async function tabellaBoarding(){
    const container = document.getElementById("tabellaBoarding");
    if (!container) return;
    const instazioneTabella=[['cognomePaziente','Cognome'], ['nomePaziente','Nome'], ['dataNascita','Data di nascita']  ];
    try {
        const response = await fetch("/pazientiPerSetting/7");
        const pazientiBoarding = await response.json();
        console.log("Pazienti in boarding:", pazientiBoarding);
        container.innerHTML = "";
        container.innerHTML = "<h4 class='h5 border-bottom pb-2 mb-3'>PAZIENTI IN BOARDING</h4>";
        const table = document.createElement("table");
        table.classList.add("table", "table-striped", "table-hover", "table-sm"); 
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        instazioneTabella.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText[1];
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement("tbody"); 
        pazientiBoarding.forEach(p => {
            const tr = document.createElement("tr");    
            instazioneTabella.forEach(key => {
                const td = document.createElement("td");
                td.textContent = p[key[0]];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    } catch (error) {
         console.error("Errore durante il recupero dei pazienti in boarding:", error);
     }

}
export { tabellaBoarding };
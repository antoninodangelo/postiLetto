async function creaCardRepartoConLettiSVG() {
    async function caricaDatiDash(IDSetting) {       
        const response = await fetch(`/getDatiDash/${IDSetting}`);
        if (!response.ok) {
            console.error("Errore fetch per ID:", IDSetting);
            return [];
        }
        return await response.json();
    }

    const response = await fetch('/getSetting');
    document.getElementById("dashboardReparti").innerHTML = "";
    document.getElementById("tabellaTrasf").innerHTML = "";

    let zone = [];
    if (response.ok) {
        zone = await response.json();             
        zone = zone.filter(e => e.IDSetting !== 7 && e.IDSetting !== 4);
    }
    const svgHtml =`
   <svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="letto" viewBox="0 0 200 200">

    <!-- BASE LETTO -->
    <rect x="20" y="110" width="160" height="50" rx="18" ry="18" />

    <!-- MATERASSO -->
    <rect x="28" y="90" width="144" height="30" rx="10" ry="10" />

    <!-- TESTIERA -->
    <rect x="20" y="60" width="60" height="40" rx="16" ry="16" />

    <!-- CUSCINO -->
    <rect x="30" y="70" width="40" height="24" rx="10" ry="10" />

    <!-- CROCE SANITARIA -->
    <rect x="140" y="70" width="10" height="30" rx="3" ry="3" />
    <rect x="135" y="80" width="20" height="10" rx="3" ry="3" />

  </symbol>
</svg>

`;
document.getElementById("dashboardReparti").insertAdjacentHTML("beforeend", svgHtml);
 
    // 🔥 IMPORTANTE: usare for...of, NON forEach
    for (const zona of zone) {
        const datiDash = await caricaDatiDash(zona.IDSetting);
        const totale = datiDash.find(r => r["POSTI LETTO TOTALI"] === "LIBERO")?.["POSTI TOTALI"] || 0
        const liberi = datiDash.find(r => r["POSTI LETTO TOTALI"] === "LIBERO")?.["N°"] || 0;
        const occupati=datiDash.find(r => r["POSTI LETTO TOTALI"] === "OCCUPATO")?.["N°"] || 0;
        const inTrasferimento=datiDash.find(r => r["POSTI LETTO TOTALI"] === "IN TRASFERIMENTO")?.["N°"] || 0;
        const prenotato=datiDash.find(r => r["POSTI LETTO TOTALI"] === "PRENOTATO")?.["N°"] || 0;
        const chiusuraFerie=datiDash.find(r => r["POSTI LETTO TOTALI"] === "CHIUSURA FERIE")?.["N°"] || 0;
        const oscurato = datiDash.find(r => r["POSTI LETTO TOTALI"] === "OSCURATO")?.["N°"] || 0;
        const chiusuraAltro = datiDash.find(r => r["POSTI LETTO TOTALI"] === "CHIUSO ALTRO")?.["N°"] || 0;

        const card = document.createElement("div");
        card.className = "card reparto-card mb-3 w-100";

        card.innerHTML = `
    <div class="card-body p-2">

        <div class="text-center mb-1">
            <h6 class="card-title mb-0">${zona.setting}-<span class="struttura-circle">${zona.nomeAzienda}</span></h6>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-1">
            <p class="mb-0 small">
                Pazienti in trasferimento: <strong>${inTrasferimento}</strong>
            </p>

            <svg class="letto-svg occupato">
                <use href="#letto"></use>
            </svg>
        </div>

        <div class="info-extra grid-2">
            <p><strong>TOTALE LETTI NEL SETTING :</strong> ${totale}</p>
            <p><strong>TOTALE LETTI OCCUPATI:</strong> ${occupati}</p>
            <p><strong>TOTALE LETTI LIBERI:</strong> ${liberi}</p>
            <p><strong>TOTALE LETTI CHIUSI NER PERIODO DI FERIE:</strong> ${chiusuraFerie}</p>
            <p><strong>TOTALE LETTI OSCURATI:</strong> ${oscurato}</p>
        </div>

    </div>
`;


        document.getElementById("dashboardReparti").appendChild(card);
    }
}

export {creaCardRepartoConLettiSVG}
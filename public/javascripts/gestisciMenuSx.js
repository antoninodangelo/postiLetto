function creaMenuSx(
    IDPubblico,
    gancio,
    user,
    caricaSetting,
    generaTabellaPazienti,
    settingUtente,
    gestisciChiusure,
    creaCardRepartoConLettiSVG,
    gestionePiano,
    generaTabellaLettiOccupati,
    tabellaPazientiGestiti
) {

    const menuSx = document.getElementById(gancio);
    menuSx.innerHTML = "";

    // 🔥 Definisco il listener (una sola volta)
    if (!window._menuListener) {

        window._menuListener = async function(e) {

            if (e.target.classList.contains('lettiOccupati')) {
                document.getElementById('dashboardReparti').innerHTML = "";
                document.getElementById('tabellaDimissioni').innerHTML = "";
                await generaTabellaLettiOccupati('tabellaTrasf', user.IDPubblico);

            }
            if (e.target.classList.contains('dashboard')) {
                creaCardRepartoConLettiSVG();
            }

            if (e.target.classList.contains('gestioneLettiChiusi')) {
                document.getElementById('dashboardReparti').innerHTML = "";
                document.getElementById('tabellaTrasf').innerHTML = "";
                gestisciChiusure('dashboardReparti');
            }

            if (e.target.classList.contains('lettiLiberi')) {
                document.getElementById('dashboardReparti').innerHTML = "";
                document.getElementById('tabellaTrasf').innerHTML = "";
                gestionePiano('dashboardReparti', user.IDPubblico, null, user.IDZona);
            }

            if (e.target.classList.contains('gestioneTerritorio')) {
               // document.getElementById('dashboardReparti').innerHTML = "";
                //document.getElementById('tabellaTrasf').innerHTML = "";
                window.location.href = '/territorio';
            }
            if (e.target.classList.contains('pazientiGestiti')) {
                document.getElementById('dashboardReparti').innerHTML = "";
                document.getElementById('tabellaTrasf').innerHTML = "";
                document.getElementById('tabellaDimissioni').innerHTML = "";
                
                tabellaPazientiGestiti ("dashboardReparti",6, user.IDPubblico)
            }

            
        };

        // 🔥 Aggiungo il listener UNA sola volta
        document.addEventListener("click", window._menuListener);
    }

    // 🔥 Genero il menu
    switch (IDPubblico) {
        case 50:
            menuSx.innerHTML = `
                <ul class="list-group">                    
                    <li class="list-group-item gestioneTerritorio voce-menuDx pointer">GESTIONE LETTI TERRITORIALI</li>                    
                    <li class="list-group-item lettiOccupati voce-menuDx pointer">LETTI OCCUPATI</li>
                    <li class="list-group-item pazientiGestiti voce-menuDx pointer">PAZIENTI GESTITI</li>
                    <li class="list-group-item dashboard voce-menuDx pointer">DASHBOARD</li>
                    <li class="list-group-item gestioneLettiChiusi voce-menuDx pointer">GESTIONE CHIUSURA LETTI</li>
                    <li class="list-group-item estrazioni voce-menuDx  pointer">AREA ESTRAZIONI</li>
                    <li class="list-group-item gestione voce-menuDx  pointer">AREA GESTIONE</li>
                    <li class="list-group-item gestione_operatori voce-menuDx  display=none pointer">GESTIONE OPERATORI</li>

                </ul>`;
            break;
            case 10:
            menuSx.innerHTML = `
                <ul class="list-group">
                    <li class="list-group-item gestioneTerritorio voce-menuDx pointer">GESTIONE LETTI TERRITORIALI</li>
                </ul>`;
            break;
    }
}


export { creaMenuSx };
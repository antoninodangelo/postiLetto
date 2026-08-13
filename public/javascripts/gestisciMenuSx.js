

function creaMenuSx(
    IDPubblico,
    gancio,
    user,
    caricaSetting,
    generaTabellaPazienti,
    settingUtente,
    gestisciChiusure,
    creaCardRepartoConLettiSVG,
    gestionePiano
) {

    const menuSx = document.getElementById(gancio);
    menuSx.innerHTML = "";

    // 🔥 Definisco il listener (una sola volta)
    if (!window._menuListener) {

        window._menuListener = async function(e) {

            if (e.target.classList.contains('gestionePs')) {
                document.getElementById('dashboardReparti').innerHTML = "";
                await caricaSetting(user.IDUtente, user.IDPubblico);
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
                document.getElementById('dashboardReparti').innerHTML = "";
                document.getElementById('tabellaTrasf').innerHTML = "";
                window.location.href = '/territorio';
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
                    <li class="list-group-item gestionePs voce-menuDx">TORNA A GESTIONE P.L.</li>
                    <li class="list-group-item gestioneTerritorio voce-menuDx">GESTIONE LETTI TERRITORIALI</li>
                    <li class="list-group-item dashboard voce-menuDx">DASHBOARD</li>
                    <li class="list-group-item gestioneLettiChiusi voce-menuDx">GESTIONE CHIUSURA LETTI</li>
                    <li class="list-group-item lettiLiberi voce-menuDx d-none">VISTA PIANO ANNO CORRENTE</li>
                </ul>`;
            break;
            case 10:
            menuSx.innerHTML = `
                <ul class="list-group">
                    <li class="list-group-item gestionePs voce-menuDx">TORNA A GESTIONE P.L.</li>
                    <li class="list-group-item gestioneTerritorio voce-menuDx">GESTIONE LETTI TERRITORIALI</li>
                    
                </ul>`;
            break;
    }
}


export { creaMenuSx };
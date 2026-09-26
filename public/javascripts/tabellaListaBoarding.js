function listaPzBoarding(gancio, datiForm) {

    const divGancio = document.querySelector(`#${gancio}`);

    if (!divGancio) {
        console.log("Impossibile trovare il gancio HTML");
        return false;
    }

    divGancio.innerHTML = "";

    const div_aggiungiUtente = document.createElement('div');
    const btn_aggiungiUtente = document.createElement('button');

    btn_aggiungiUtente.textContent = "Aggiungi Nuovo Utente";
    btn_aggiungiUtente.classList.add(
        'btn',
        'btn-outline-primary',
        'd-flex',
        'align-items-center',
        'gap-2'
    );

    btn_aggiungiUtente.innerHTML = `
    <i class="bi bi-person-fill fs-4"></i>
    <span>Aggiungi Nuovo Utente</span>
`;

    div_aggiungiUtente.appendChild(btn_aggiungiUtente);

    divGancio.appendChild(div_aggiungiUtente);
    btn_aggiungiUtente.addEventListener('click',e=>{
        datiForm.IDPostoLetto=181
        console.log(datiForm);
        attivaModal(e, 181, 7, 'insPaziente');
    })
}

export { listaPzBoarding };
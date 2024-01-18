const socket = io();

let nbUsers = document.getElementById('nb_users')
let pseudoForm = document.getElementById('pseudo_form')
let input = document.getElementById('pseudo_input')
let button = document.getElementById('pseudo_btn')
let sondageList = document.getElementById('list')
let createForm = document.getElementById('create_form')
let sondageContainer = document.getElementById('sondage_container')
let backBtn = document.getElementById('back_btn')
let sondageContent = document.getElementById('sondage_content')
let sondageResultats = document.getElementById('sondage_resultats')
let organisateurForm = document.getElementById('organisateur_form')

button.addEventListener('click', () => {
    socket.emit('user connexion', input.value)

    pseudoForm.style.display = 'none'
    sondageList.style.display = 'block'
    createForm.style.display = 'block'

    document.getElementById('infos').style.display = "block"
    document.getElementById('your_pseudo').innerText = input.value
})

document.getElementById('new_sondage_btn').addEventListener('click', () => {
    createSondage()
})

socket.on('get connected users', (users) => {
    nbUsers.innerText = Object.entries(users).length.toString()
})

socket.on('get sondages list', (sondages) => {
    sondageList.innerText = ''

    if (Object.entries(sondages).length) {
        for (const [id, sondage] of Object.entries(sondages)) {
            const item = document.createElement('button')
            item.textContent = sondage.nom
            sondageList.appendChild(item)

            item.addEventListener('click', () => {
                joinSondage(id, sondage)
            })
        }
    } else {
        sondageList.innerText = 'Aucun sondage en cours'
    }
})

socket.on('sondage players', (players) => {
    let playerList= document.getElementById('sondage_players')
    playerList.innerText = ''
    for (const [id, player] of Object.entries(players)) {
        const item = document.createElement('li');
        item.textContent = player.pseudo;
        playerList.appendChild(item);
    }
})

socket.on('question to players', (question, sondageId) => {
    sondageContent.innerHTML = `
        Nouvelle question:
        <br />
        ${question.question}
        <br />
        <button id="reponse_1_btn">${question.reponse1.libelle}</button>
        <button id="reponse_2_btn">${question.reponse2.libelle}</button>
    `
    sondageContent.style.display = 'block'

    document.getElementById('reponse_1_btn').addEventListener('click', () => {
        envoyerReponse(sondageId, 1)
    })

    document.getElementById('reponse_2_btn').addEventListener('click', () => {
        envoyerReponse(sondageId, 2)
    })
})

socket.on('send resultats', (question) => {
    sondageResultats.innerHTML = `
        Résultat question: ${question.question}
        <br />
        ${question.reponse1.libelle}: ${question.reponse1.nbVotes}
        <br />
        ${question.reponse2.libelle}: ${question.reponse2.nbVotes}
    `
    sondageResultats.style.display = 'block'
})

socket.on('active question', (organisateurId) => {
    organisateurForm.style.display = 'none'
    sondageContent.style.display = 'none'

    if (organisateurId === socket.id) {
        sondageResultats.style.display = 'block'
    }
})

function joinSondage(id, sondage) {
    let sondageName = document.getElementById('sondage_name')
    backBtn.addEventListener('click', () => {
        leaveSondage()
    })

    sondageList.style.display = 'none'
    createForm.style.display = 'none'
    sondageContainer.style.display = 'block'

    socket.emit('join sondage', id)

    sondageName.innerText = 'Sondage ' + sondage.nom + ' de ' + sondage.organisateur.pseudo

    if (sondage.organisateur.id === socket.id) {
        afficherSondageForm(id)
    } else {
        sondageContent.innerText = 'En attente de l\'organisateur...'
        sondageContent.style.display = 'block'
    }

}

function leaveSondage() {
    socket.emit('leave sondage')

    sondageContainer.style.display = 'none'
    sondageList.style.display = 'block'
    createForm.style.display = 'block'
    sondageResultats.style.display = 'none'
    organisateurForm.style.display = 'none'
    sondageContent.style.display = 'none'
    activeQuestion = false
}

function createSondage() {
    let sondageName = document.getElementById('new_sondage_input')

    if (sondageName.length !== 0) {
        socket.emit('create sondage', sondageName.value)

        sondageName.value = ''
    }
}

function afficherSondageForm(idSondage) {
    organisateurForm.style.display = 'block'
    organisateurForm.innerHTML = `
        <label for="organisateur_question">Question:</label>
        <input type="text" id="organisateur_question">
        <br />
        <label for="reponse_1_input">Réponse possible 1</label><input type="text" id="reponse_1_input">
        <br />
        <label for="reponse_2_input">Réponse possible 2</label><input type="text" id="reponse_2_input">
        <br />

        <button type="button" id="organisateur_btn">Valider</button>
    `
    let question = document.getElementById('organisateur_question')
    let reponse1 = document.getElementById('reponse_1_input')
    let reponse2 = document.getElementById('reponse_2_input')

    question.value = ''
    reponse1.value = ''
    reponse2.value = ''

    document.getElementById('organisateur_btn').addEventListener('click', () => {
        socket.emit('org create question', idSondage, question.value, reponse1.value, reponse2.value)

        question.value = ''
        reponse1.value = ''
        reponse2.value = ''

        organisateurForm.style.display = 'none'
        sondageResultats.style.display = 'block'
        sondageResultats.innerText = 'En attente des votes...'
    })
}

function envoyerReponse(idSondage, reponse) {
    socket.emit('player response', idSondage, reponse)
    sondageContent.innerText= ''
    sondageContent.style.display = 'none'
}
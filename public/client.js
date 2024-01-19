const socket = io();

let content = document.getElementById('content')
let pseudoFormBtn = document.getElementById('pseudo_btn')

pseudoFormBtn.addEventListener('click', () => {
    let input = document.getElementById('pseudo_input')

    socket.emit('user connexion', input.value)

    cacherPseudoForm()

    afficherInfos(input.value)
    afficherSondageCreateForm()
})

socket.on('get connected users', (users) => {
    let nbUserDiv = document.getElementById('nb_users')

    if (nbUserDiv) {
        nbUserDiv.innerText = Object.entries(users).length.toString()
    }
})

socket.on('get sondages list', (sondages, isOrgDisconnect = false) => {
    if (!isOrgDisconnect) {
        afficherSondageListe(sondages)
    } else {
        afficherMessage('Le sondage n\'existe plus')
    }
})

socket.on('sondage players', (players) => {
    afficherSondagePlayers(players)
})

socket.on('question to players', (question, sondageId) => {
    cacherMessage()
    afficherAnswerForm(question, sondageId)
})

socket.on('send resultats', (question) => {
    afficherQuestionResultats(question)
    cacherMessage()
})

socket.on('active question', (organisateurId, question, sondageId) => {
    cacherSondageForm()

    if (organisateurId === socket.id) {
        if (question.reponse1.nbVotes > 0 || question.reponse2.nbVotes > 0) {
            afficherQuestionResultats(question)
        } else {
            afficherMessage('En attente des votes...')
        }
    } else {
        const alreadyVoted = question.votants.find((votant) => votant === socket.id);

        cacherMessage()
        if (alreadyVoted) {
            afficherMessage('Vous avez déjà voté pour cette question')
            afficherQuestionResultats(question)
        } else {
            afficherAnswerForm(question, sondageId)
        }

        /**
         * TODO autres trucs:
         *
         * - pouvoir supprimer un sondage si organisateur
         * - pouvoir passer à la question suivante
         */
    }
})

function joinSondage(id, sondage) {
    cacherSondageListe()
    cacherSondageCreateForm()
    afficherBoutonRetour()
    afficherSondageName('Sondage ' + sondage.nom + ' de ' + sondage.organisateur.pseudo)

    socket.emit('join sondage', id)

    if (sondage.organisateur.id === socket.id) {
        afficherSondageForm(id)
    } else {
        afficherMessage('En attente de l\'organisateur...')
    }

}

function leaveSondage() {
    socket.emit('leave sondage')

    cacherBoutonRetour()
    cacherSondageName()
    cacherSondagePlayers()
    cacherSondageForm()
    cacherAnswerForm()
    cacherMessage()
    cacherAnswerForm()
    cacherQuestionResultats()

    afficherSondageCreateForm()
}

function createSondage() {
    let sondageName = document.getElementById('new_sondage_input')

    if (sondageName.length !== 0) {
        socket.emit('create sondage', sondageName.value)

        sondageName.value = ''
    }
}

function envoyerReponse(idSondage, reponse) {
    socket.emit('player response', idSondage, reponse)
    cacherAnswerForm()
}
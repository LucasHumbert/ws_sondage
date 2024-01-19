/**
 * AFFICHAGE
 */

function afficherInfos(pseudo) {
    const item = document.createElement('div');
    item.id = 'user_infos'
    item.innerHTML = `
        Votre pseudo: ${pseudo}
        <br />
        En ligne: <span id="nb_users"></span>
        <hr />
        <br />
    `
    content.appendChild(item)
}

function cacherPseudoForm() {
    let pseudoForm = document.getElementById('pseudo_form')

    if (pseudoForm) {
        pseudoForm.remove()
    }
}

function afficherSondageListe(sondages) {
    if (document.getElementById('pseudo_form') || document.getElementById('sondage_name')) {
        return
    }

    let div = document.getElementById('sondage_liste')
    let divExist = false

    if (div) {
        div.innerText = ''
        divExist = true
    } else {
        div = document.createElement('div');
        div.id = 'sondage_liste'
    }

    if (Object.entries(sondages).length) {
        for (const [id, sondage] of Object.entries(sondages)) {
            const item = document.createElement('button')
            item.textContent = sondage.nom
            div.appendChild(item)

            item.addEventListener('click', () => {
                joinSondage(id, sondage)
            })
        }
    } else {
        div.innerText = 'Aucun sondage en cours'
    }

    if (!divExist) {
        content.appendChild(div)
    }
}

function cacherSondageListe() {
    let sondageListe = document.getElementById('sondage_liste')

    if (sondageListe) {
        sondageListe.remove()
    }
}

function afficherSondageCreateForm() {
    if (document.getElementById('pseudo_form') || document.getElementById('sondage_liste') || document.getElementById('sondage_create_form')) {
        return
    }

    const div = document.createElement('div');
    div.id = 'sondage_liste'
    content.appendChild(div)

    const item = document.createElement('div');
    item.id = 'sondage_create_form'
    item.innerHTML = `
        <br />
        <hr />
        <label for="new_sondage_input">Créer un sondage</label>
        <input type="text" id="new_sondage_input">
        <button type="button" id="new_sondage_btn">Créer</button>
    `
    content.appendChild(item)

    document.getElementById('new_sondage_btn').addEventListener('click', () => {
        createSondage()
    })
}

function cacherSondageCreateForm() {
    let sondageCreateForm = document.getElementById('sondage_create_form')

    if (sondageCreateForm) {
        sondageCreateForm.remove()
    }
}

function afficherBoutonRetour() {
    if (document.getElementById('pseudo_form') || document.getElementById('back_btn')) {
        return
    }

    const item = document.createElement('button');
    item.id = 'back_btn'
    item.type = 'button'
    item.innerText = `Retour à la liste`
    content.appendChild(item)

    document.getElementById('back_btn').addEventListener('click', () => {
        leaveSondage()
    })
}

function cacherBoutonRetour() {
    let boutonRetour = document.getElementById('back_btn')

    if (boutonRetour) {
        boutonRetour.remove()
    }
}

function afficherSondageName(name) {
    if (document.getElementById('pseudo_form') || document.getElementById('sondage_name')) {
        return
    }

    const item = document.createElement('div');
    item.id = 'sondage_name'
    item.innerText = name
    content.appendChild(item)

    const div = document.createElement('div');
    div.id = 'sondage_players'
    content.appendChild(div)
}

function cacherSondageName() {
    let sondageName = document.getElementById('sondage_name')

    if (sondageName) {
        sondageName.remove()
    }
}

function afficherSondagePlayers(players) {
    let playerList= document.getElementById('sondage_players')
    playerList.innerText = ''
    playerList.innerHTML = `<br />Utilisateurs dans le sondage:`
    for (const [id, player] of Object.entries(players)) {
        const item = document.createElement('li');
        item.textContent = player.pseudo;
        playerList.appendChild(item);
    }
    playerList.innerHTML += `<br />`
}

function cacherSondagePlayers() {
    let sondagePlayers = document.getElementById('sondage_players')

    if (sondagePlayers) {
        sondagePlayers.remove()
    }
}

function afficherSondageForm(idSondage) {
    if (document.getElementById('pseudo_form') || document.getElementById('organisateur_form')) {
        return
    }

    const item = document.createElement('div');
    item.id = 'organisateur_form'
    item.innerHTML = `
        <label for="organisateur_question">Question:</label>
        <input type="text" id="organisateur_question">
        <br />
        <label for="reponse_1_input">Réponse possible 1</label><input type="text" id="reponse_1_input">
        <br />
        <label for="reponse_2_input">Réponse possible 2</label><input type="text" id="reponse_2_input">
        <br />

        <button type="button" id="organisateur_btn">Valider</button>
    `
    content.appendChild(item)

    document.getElementById('organisateur_btn').addEventListener('click', () => {
        let question = document.getElementById('organisateur_question')
        let reponse1 = document.getElementById('reponse_1_input')
        let reponse2 = document.getElementById('reponse_2_input')

        socket.emit('org create question', idSondage, question.value, reponse1.value, reponse2.value)

        question.value = ''
        reponse1.value = ''
        reponse2.value = ''

        cacherSondageForm()
        afficherMessage('En attente des votes...')
    })
}

function cacherSondageForm() {
    let sondageForm = document.getElementById('organisateur_form')

    if (sondageForm) {
        sondageForm.remove()
    }
}

function afficherAnswerForm(question, sondageId) {
    if (document.getElementById('pseudo_form') || document.getElementById('question_form')) {
        return
    }

    const item = document.createElement('div');
    item.id = 'question_form'
    item.innerHTML = `
        Nouvelle question:
        <br />
        ${question.question}
        <br />
        <button id="reponse_1_btn">${question.reponse1.libelle}</button>
        <button id="reponse_2_btn">${question.reponse2.libelle}</button>
    `
    content.appendChild(item)

    document.getElementById('reponse_1_btn').addEventListener('click', () => {
        envoyerReponse(sondageId, 1)
    })

    document.getElementById('reponse_2_btn').addEventListener('click', () => {
        envoyerReponse(sondageId, 2)
    })
}

function cacherAnswerForm() {
    let questionForm = document.getElementById('question_form')

    if (questionForm) {
        questionForm.remove()
    }
}

function afficherMessage(message) {
    if (document.getElementById('pseudo_form')) {
        return
    }

    let messageDiv = document.getElementById('message')
    if (messageDiv) {
        messageDiv.innerHTML += `
            <br />
            ${message}
        `
    } else {
        const item = document.createElement('div');
        item.id = 'message'
        item.innerText = message
        content.appendChild(item)
    }
}

function cacherMessage() {
    let message = document.getElementById('message')

    if (message) {
        message.remove()
    }
}

function afficherQuestionResultats(question) {
    if (document.getElementById('pseudo_form')) {
        return
    }

    let resultDiv= document.getElementById('resultat')

    if (resultDiv) {
        resultDiv.remove()
    }

    const item = document.createElement('div');
    item.id = 'resultat'
    item.innerHTML = `
        Résultat question: ${question.question}
        <br />
        ${question.reponse1.libelle}: ${question.reponse1.nbVotes}
        <br />
        ${question.reponse2.libelle}: ${question.reponse2.nbVotes}
    `
    content.appendChild(item)
}

function cacherQuestionResultats() {
    let resultat = document.getElementById('resultat')

    if (resultat) {
        resultat.remove()
    }
}
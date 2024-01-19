const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/index.html'));
});

let users = {}
let sondages = {}

io.on('connection', (socket) => {
    let currentSondageId = -1;
    sendConnectedUsersToAll()

    socket.on('user connexion', (pseudo) => {
        if (!users[socket.id]) {
            users[socket.id] = { pseudo: pseudo }
            sendConnectedUsersToAll()
            sendSondageList()
        }
    })

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            delete users[socket.id]
            sendConnectedUsersToAll()
            let isOrganisateur = sondages[currentSondageId] ? sondages[currentSondageId].organisateur.id === socket.id : false
            sendSondageListToAll(isOrganisateur)
        }
    })

    socket.on('join sondage', (id) => {
        currentSondageId = id;
        socket.join(currentSondageId);

        let isOrganisateur = sondages[id].organisateur.id === socket.id

        if (users[socket.id]) { // TODO   && !isOrganisateur
            sondages[id].joueurs[socket.id] = { pseudo: users[socket.id].pseudo }
        }

        sendSondagePlayersToAll(id)

        let activeQuestion = getSondageActiveQuestion(id)

        if (activeQuestion) {
            socket.emit('active question', sondages[currentSondageId].organisateur.id, activeQuestion, currentSondageId)
        }
    })

    socket.on('leave sondage', () => {
        socket.leave(currentSondageId)
        if (sondages[currentSondageId]) {
            delete sondages[currentSondageId].joueurs[socket.id]
            sendSondagePlayersToAll(currentSondageId)
            currentSondageId = -1
        }
        sendSondageList()
        sendSondagePlayersToAll()
    })

    socket.on('create sondage', (sondageName) => {
        let newId = Object.keys(sondages).length + 1
        sondages[newId] = {
            nom: sondageName,
            joueurs: {},
            organisateur: {
                id: socket.id,
                pseudo: users[socket.id].pseudo
            },
            questions: {}
        }

        sendSondageListToAll()
    })

    socket.on('org create question', (idSondage, question, reponse1, reponse2) => {
        let sondage = sondages[idSondage]
        if (sondage) {
            let newId = Object.entries(sondage.questions).length + 1
            let newQuestion = {
                question: question,
                reponse1: {
                    libelle: reponse1,
                    nbVotes: 0
                },
                reponse2: {
                    libelle: reponse2,
                    nbVotes: 0
                },
                active: true,
                votants: []
            }
            sondage.questions[newId] = newQuestion

            sendQuestionToAllPlayers(newQuestion)
        }
    })

    socket.on('player response', (idSondage, reponse) => {
        let question = getSondageActiveQuestion(idSondage)

        if (question) {
            if (reponse === 1) {
                sondages[idSondage].questions[question.id].reponse1.nbVotes += 1
            } else if (reponse === 2) {
                sondages[idSondage].questions[question.id].reponse2.nbVotes += 1
            }

            sondages[idSondage].questions[question.id].votants.push(socket.id)

            sendResultatsToAll(idSondage)
        }
    })

    function sendConnectedUsersToAll() {
        io.emit('get connected users', users)
    }

    function sendSondageList() {
        socket.emit('get sondages list', getActiveSondages())
    }

    function sendSondageListToAll(isOrgDisconnect = false) {
        io.emit('get sondages list', getActiveSondages(), isOrgDisconnect)
    }

    function getActiveSondages() {
        let result = {}
        for (const [id, sondage] of Object.entries(sondages)) {
            if (users[sondage.organisateur.id]) {
                result[id] = sondage
            }
        }

        return result
    }

    function sendSondagePlayersToAll(sondageId) {
        if (sondages[sondageId]) {
            io.to(currentSondageId).emit('sondage players', sondages[sondageId].joueurs)
        }
    }

    function sendQuestionToAllPlayers(question) {
        socket.broadcast.to(currentSondageId).emit("question to players", question, currentSondageId);
    }

    function getSondageActiveQuestion(idSondage) {
        let result = {}
        for (const [id, question] of Object.entries(sondages[idSondage].questions)) {
            if (question.active) {
                question['id'] = id
                result = question
                break;
            }
        }

        return Object.entries(result).length ? result : null
    }

    function sendResultatsToAll(idSondage) {
        let question = getSondageActiveQuestion(idSondage)

        if (question) {
            io.to(currentSondageId).emit('send resultats', question)
        }
    }
})

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
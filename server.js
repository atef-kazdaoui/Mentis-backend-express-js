// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Créer une application Express
const app = express();

// Créer un serveur HTTP avec Express
const server = http.createServer(app);

// Initialiser Socket.io sur le serveur
const io = socketIo(server);

// Utilisation de Express pour servir une route basique
app.get('/', (req, res) => {
    res.send('Bienvenue dans l\'API de chat!');
});

// Créer un chat en temps réel
let users = [];

io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté');

    // Quand un utilisateur se connecte, il doit s'identifier
    socket.on('setUser', (username) => {
        users[socket.id] = username;
        console.log(`${username} a rejoint le chat`);

        // Envoie un message à tous les utilisateurs
        io.emit('chatMessage', `${username} a rejoint le chat`);
    });

    // Gérer l'envoi de messages entre utilisateurs
    socket.on('sendMessage', (data) => {
        const { to, message } = data;

        // Vérifier si le destinataire existe
        const toSocketId = Object.keys(users).find(key => users[key] === to);

        if (toSocketId) {
            // Envoie un message au destinataire spécifique
            io.to(toSocketId).emit('chatMessage', `${users[socket.id]}: ${message}`);
        }
    });

    // Quand un utilisateur se déconnecte
    socket.on('disconnect', () => {
        const username = users[socket.id];
        delete users[socket.id];

        console.log(`${username} a quitté le chat`);

        // Notifier tous les utilisateurs de la déconnexion
        io.emit('chatMessage', `${username} a quitté le chat`);
    });
});

// Démarrer le serveur sur le port 3000
server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});

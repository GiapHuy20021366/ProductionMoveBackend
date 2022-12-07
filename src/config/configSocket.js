import authenticationService from '../services/authenticationServices'
import { messageTitles } from './constant'
const users = {}

const insertSocket = (socket) => {
    if (!users[socket.partnerId]) {
        users[socket.partnerId] = {}
    }
    users[socket.partnerId][socket.id] = socket
}

const removeSocket = (socket) => {
    if (users[socket.partnerId]) {
        for (let socketId of Object.keys(users[socket.partnerId])) {
            if (!users[socket.partnerId][socketId]) {
                delete users[socket.partnerId][socketId]
            }
        }
    }
}

const pingSocket = (partnerId, message, title) => {
    const sockets = users[partnerId]
    if (sockets) {
        for (let socketId of Object.keys(sockets)) {
            sockets[socketId].emit(title, { message })
        }
    }
}

const setupSocketIO = (socketIo) => {
    socketIo.on("connection", (socket) => {
        console.log("New client connected " + socket.id);
        if (!socket.isAuthenticated) {
            socket.emit(messageTitles.NEED_AUTHENTICATE)
        }

        socket.on(messageTitles.AUTHENTICATE_REQUEST, async (token) => {
            if (socket.isAuthenticated) {
                socket.emit(messageTitles.AUTHENTICATE_RESPONSE, { status: 'ALREADY_AUTHENTICATED' })
                return
            }
            await authenticationService.verifyToken(token).then((message) => {
                socket.isAuthenticated = true
                socket.partnerId = message.data.data.id
                insertSocket(socket)
                socket.emit(messageTitles.AUTHENTICATE_RESPONSE, { status: 'SUCCESS' })
                console.log("Authenticated: " + socket.partnerId)
            }).catch((error) => {
                socket.emit(messageTitles.AUTHENTICATE_RESPONSE, { status: 'FAIL' })
            })
        })

        socket.on('disconnect', () => {
            removeSocket(socket)
            console.log('user disconnected');
        });
    });
}

module.exports = {
    setupSocketIO,
    pingSocket
}

// export default setupSocket
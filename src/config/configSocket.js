import authenticationService from '../services/authenticationServices'

const setupSocket = (socketIo) => {
    socketIo.on("connection", (socket) => {
        console.log("New client connected " + socket.id);

        socket.on("Authenticate", async (token) => {
            await authenticationService.verifyToken(token).then((message) => {
                socket.isAuthenticated = true
                socket.emit("Authenticate", { status: 'SUCCESS' })
                console.log("Authenticated")
            }).catch((error) => {
                socket.emit("Authenticate", { status: 'FAIL' })
            })
        })
    });
}

export default setupSocket
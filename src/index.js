const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { generateMassage, generateLocationMassage } = require('./utils/messages')
const { addUsers, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const port = process.env.PORT || 3000
const path_directory = path.join(__dirname, '../public')

//server(emit)->client(recieve)-countUpdated--acknowledgement-->server
//clinet(emit)->server(recieve)-increment--acknowledgement-->server
// let count = 0;

app.use(express.static(path_directory))
io.on('connection', (socket) => {
    console.log("New WebSocket Connection!")
        //socket.emit,io.emit,socket.broadcast.emit
        //io.to.emit,socket.broadcast.to.emit
        // socket.to.emit("message", generateMassage(`Welcome back to my site ${username}!`))
        // socket.broadcast.to.emit("message", generateMassage(`${username} has joined`)
    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUsers({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit("message", generateMassage("Admin", `Welcome back to my site ${user.username}!`))
        socket.broadcast.to(user.room).emit("message", generateMassage("Admin", `${user.username} has joined`))
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on("Sendmessage", (message, callback) => {
        //console.log(mess)
        const user = getUser(socket.id)
        if (!user) {
            return callback("didn't get user")
        }
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('profanity is not allowed!')
        }
        io.to(user.room).emit("message", generateMassage(user.username, filter.clean(message)))
        callback("Delivered!")
    })
    socket.on("disconnect", () => {
        //const user=getUser(socket.id)
        const user = removeUser(socket.id)
        if (user) {
            const username = user.username
            io.to(user.room).emit("message", generateMassage("Admin", `${user.username} has left`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    socket.on("sendLocation", (cords, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return callback("didn't get user")
        }
        io.to(user.room).emit("Location-message", generateLocationMassage(user.username, `https://google.com/maps?q=${cords.latitude},${cords.longitude}`))
            // setTimeout(() => {
        callback("Location Shared!")
            //}, 2000)

    })



    // socket.emit("CountUpdated", count)
    // socket.on("increment", () => {
    //     count++;
    //     // socket.emit("CountUpdated", count) //it shows only for one particular connection
    //     io.emit("CountUpdated", count)

    // })
})
server.listen(port, () => {
    console.log(`server is up on port ${port}!`)
})
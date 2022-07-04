const PORT = 3001;

const server = require('http').Server();
const socket = require('socket.io');
const io = socket(server, { transports: ['websocket'] });
const users = {} // Stores the list of users
const pty = require('node-pty');
let terminalPtys = {}; // {roomName: ptyProcess}



io.sockets.on('connection', socket => {
    

   

    socket.on('join-textarea', async (room) => {
        socket.leaveAll();
        socket.join(room);
        console.log(socket.id, 'joining textarea room', room);
        // emit a new event to let people know when someone joins
        // When a new user joins we send a string with their name
        // socket.on('new-user', name => {
        //     users[socket.id] = name;
        //     socket.broadcast.emit('user-connected', name)
        //   })
        //   //Send a chat message with their name
        //   socket.on('send-chat-message', message => {
        //     socket.broadcast.emit('chat-message', 
        //     {message, name:     users[socket.id] } )
        //   })
        //   socket.on('disconnect', () => {
        //     socket.broadcast.emit('user-disconnected', users[socket.id])
        //     delete users[socket.id]
        //   })

        // socket.broadcast.emit("New user joined");
        // socket.in(room).emit('New User joined');

        // socket.on('userconnect', (newVal) => {
        //     socket.in(room).emit('userconnect', newVal);
        // });

        // socket.on('userconnect', (newVal) => {


        let justJoinedId = socket.id;
        let roomsSockets = (await io.in(room).fetchSockets())[0].nsp.sockets;
        let roomsSocketsIds = Array.from(roomsSockets.keys())
            .filter(
                function (e) {
                    if (e !== justJoinedId) return true;
                    else return false;
                });

        if(roomsSocketsIds.length > 0) {
            roomsSockets.get(roomsSocketsIds[0]).emit('userconnect', justJoinedId);
            console.log('filtered array of ids', roomsSocketsIds);
        }
        

        // });

        socket.on('existingvalue', ({giveValueToThisId, value}) => {
            roomsSockets.get(giveValueToThisId).emit('textarea', value);
            console.log('recieving existing value', value);
        });



        socket.on('textarea', (value) => {
            // when the existing socket gets this event emit a current value
            // socket.in(room).emit('textarea', 'New User Joined');
            socket.in(room).emit('textarea', value);
            // when the server recieves this value, emit a new event and send the value to the newly joined socket
        });
        
    });
 
    socket.on('join-terminal', (room) => {
        if (!terminalPtys[room]) {
            const ptyProcess = pty.spawn(this.command, this.args || [], {
                name: 'xterm-color',
                // cols: 80,
                // rows: 20,
                // cwd: process.env.HOME,
                env: process.env
            });
            ptyProcess.onData((output) => {
                socket.in(room).emit('stdo', output);
            });
            terminalPtys[room] = ptyProcess;
        }
        else {
            terminalPtys[room].write('clear\n');
        }
        socket.leaveAll();
        socket.join(room);
        console.log(socket.id, 'joining terminal room', room);

        socket.on('stdin', (stdin) => {
            terminalPtys[room].write(stdin);
        })
    });

    socket.on('disconnect', async (reason) => {
        socket.leaveAll();
        socket.removeAllListeners();
        console.log(socket.id, 'leaving all rooms');
    })
});

server.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
});

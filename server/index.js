const PORT = 3001;
const server = require('http').Server();
const socket = require('socket.io');
const io = socket(server, { transports: ['websocket'] });
const users = {}
const pty = require('node-pty');
let terminalPtys = {};

io.sockets.on('connection', socket => {
    socket.on('join-textarea', async (room) => {
        socket.leaveAll();
        socket.join(room);
        console.log(socket.id, 'joining textarea room', room);
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
        socket.on('existingvalue', ({giveValueToThisId, value}) => {
            roomsSockets.get(giveValueToThisId).emit('textarea', value);
            console.log('recieving existing value', value);
        });
        socket.on('textarea', (value) => {
            socket.in(room).emit('textarea', value);
        });
    });
    socket.on('join-terminal', (room) => {
        if (!terminalPtys[room]) {
            const ptyProcess = pty.spawn(this.command, this.args || [], {
                name: 'xterm-color',
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

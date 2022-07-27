const PORT = 3001;
const server = require('http').Server();
const socket = require('socket.io');
const io = socket(server, { transports: ['websocket'] });
const users = {}
const pty = require('node-pty');
let terminalPtys = {};
let terminals = {};
const { Terminal } = require('xterm-headless');
const { SerializeAddon } = require("xterm-addon-serialize");

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
        if (terminals[room]) {
            console.log('restoring history...');
            socket.emit('terminal-history', terminals[room].serializer.serialize());
            // console.log(terminals[room].serializer.serialize());
        }
        if(!terminals[room]) {
            terminals[room] = {terminal: new Terminal(), serializer: new SerializeAddon()};
            terminals[room].terminal.loadAddon(terminals[room].serializer);
        }
        if (!terminalPtys[room]) {
            const ptyProcess = pty.spawn(this.command, this.args || [], {
                name: 'xterm-color',
                env: process.env
            });
            ptyProcess.onData((output) => {
                socket.in(room).emit('stdo', output);
                terminals[room].terminal.write(output);
            });
            terminalPtys[room] = ptyProcess;
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

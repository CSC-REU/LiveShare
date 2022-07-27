const PORT = 3001;
const server = require('http').Server();
const socket = require('socket.io');
const io = socket(server, { transports: ['websocket'] });
const users = {}
const pty = require('node-pty');
let terminalPtys = {};

let textareaHistory = ''
let terminalHistory = ''

io.sockets.on('connection', socket => {

    socket.on('join-textarea', async room => {
        socket.leaveAll();
        socket.join(room);
        socket.emit('text', textareaHistory)
        socket.on('text', text => {
            textareaHistory = text
            socket.in(room).emit('text', text)
        });
    });

    socket.on('join-terminal', room => {
        socket.leaveAll();
        socket.join(room);

        socket.emit('terminal-history', terminalHistory)

        if (!terminalPtys[room]) {
            const ptyProcess = pty.spawn(this.command, this.args || [], {
            name: 'xterm-color',
            env: process.env
        });

        terminalPtys[room] = ptyProcess;

        ptyProcess.onData(data => {
            terminalHistory += data
            socket.in(room).emit('stdout', data)
        });
    }

        socket.on('stdin', data => {
            terminalPtys[room].write(data)
        })
    });
    
    socket.on('disconnect', async => {
        socket.leaveAll();
        socket.removeAllListeners();
    })
});

server.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}`);
});

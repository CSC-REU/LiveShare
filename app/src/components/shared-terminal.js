import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css'
const host = (window.location.hostname === "localhost") ? `${window.location.hostname}:3001` : window.location.hostname

function SharedTerminal() {
  const previousTerminal = useRef();
  const {room} = useParams();

  useEffect(() => {
    const client = io(host, {transports: ['websocket'], secure: true});

    client.emit('join-terminal', room);

    const terminal = new Terminal()

    client.on('terminal-history', terminalHistory => {terminal.write(terminalHistory)});

    terminal.open(previousTerminal.current);

    terminal.onData(data => {client.emit('stdin', data)});

    client.on('stdout', data => {terminal.write(data)});
  }, []);

  return (
    <div ref={previousTerminal} />
  );
}

export default SharedTerminal;

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Terminal } from 'xterm';
import { SerializeAddon } from "xterm-addon-serialize";
import 'xterm/css/xterm.css'

function SharedTerminal(props) {
  const [active, setActive] = useState(false)
  const terminalRef = useRef();
  const { room } = useParams();

  useEffect(() => {
    let host = window.location.hostname;
    if (host === "localhost") host += ":3001";
    const socket = io(host, { transports: ['websocket'], secure: true });
    socket.emit('join-terminal', room)

    const terminal = new Terminal()
    const serializeAddon = new SerializeAddon();
    terminal.loadAddon(serializeAddon);
    
    if (!active) {
      terminal.open(terminalRef.current) 
      setActive(true)
    }
    
    terminal.onData(data => {
      socket.emit('stdin', data)
    })

    socket.on('stdout', data => {
      terminal.write(data)
    })

  }, []);

  return (
    <div ref={terminalRef} />
  );
}

export default SharedTerminal;

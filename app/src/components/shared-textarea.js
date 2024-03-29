import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
const host = (window.location.hostname === "localhost") ? `${window.location.hostname}:3001` : window.location.hostname

function SharedTextarea() {
  const [text, setText] = useState('');
  const [socket, setSocket] = useState();
  const {room} = useParams();
  const previousText = useRef('');

  useEffect(() => {
    const client = io(host, {transports: ['websocket'], secure: true});

    client.emit('join-textarea', room);

    client.on('text', text => {setText(text)});
    
    setSocket(client);
  }, []);

  function onChangeHandler(e) {
      setText(e.target.value)
      previousText.current = e.target.va
      socket.emit('text', e.target.value)
  }

  return (
    <textarea value={text} onChange={onChangeHandler}/>
  );
}

export default SharedTextarea;

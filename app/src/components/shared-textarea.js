import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

function SharedTextarea() {
  const [value, _setValue] = useState('');
  const [socket, setSocket] = useState();
  const { room } = useParams();

  const valueRef = useRef(value);
  const setValue = (data) => {
    valueRef.current = data;
    _setValue(data);
  }

  useEffect(() => {
    let host = window.location.hostname;
    if (host === "localhost") host += ":3001";
    const s = io(host, { transports: ['websocket'], secure: true });
    s.emit('join-textarea', room);
    s.on('userconnect', (justJoinedId) => {
      s.emit('existingvalue', {giveValueToThisId: justJoinedId, value: valueRef.current});
      console.log('emitting existing value', valueRef.current);
    });
    s.on('textarea', (v) => {
      setValue(v);
    });
    setSocket(s);
  }, []);

  function onChangeHandler(e) {
    setValue(e.target.value); 
    socket.emit('textarea', e.target.value)
  }

  return (
    <textarea onChange={onChangeHandler} value={value} />
  );
}

export default SharedTextarea;

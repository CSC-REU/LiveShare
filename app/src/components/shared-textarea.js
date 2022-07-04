import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';





function SharedTextarea(props) {
  const [value, _setValue] = useState('');
  const [socket, setSocket] = useState();
  //const [newVal, setNewVal] = useState('');
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
    
    //prompt the client for their name
    // const name = prompt('What is your name?');
    // appendMessage('You joined');
    //we emit the name to new-user which the server is listening for
    // s.emit('new-user', name)
    //Send the name in the text area
    // s.on('chat-message', data => {
      // appendMessage(`${data.name}: ${data.message}`)
    // })
    //Send that the user has connected in the text area
    // s.on('user-connected', name => {
      // appendMessage(`${name} connected`)
      // s.on('textarea', (v) => {
        //Emits the current value to send to the newly joined socket
        // s.emit(v, room);
      // });
    // })
    //Send the user has disconnected in the text area
    // s.on('user-disconnected', name => {
      // appendMessage(`${name} disconnected`)
    // })
    


    s.emit('join-textarea', room);

    // note: https://file-translate.com/en/blog/react-state-in-event
    //Gets the value and sends it to the new state it received
    s.on('userconnect', (justJoinedId) => {
      // setValue(value);
      s.emit('existingvalue', {giveValueToThisId: justJoinedId, value: valueRef.current});
      console.log('emitting existing value', valueRef.current);
      
      //console.log('User has joined. obtained old value');
    });

    
    s.on('textarea', (v) => {
      setValue(v);
      //Emits the current value to send to the newly joined socket
      //s.emit(v, room);
    });
    

    setSocket(s);

    

    // function appendMessage(message) {
      // setValue(value + '\n' + message);
      // s.emit('textarea', message)
    // }
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

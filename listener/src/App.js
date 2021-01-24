import logo from './logo.svg';
import './App.css';
import { useState } from "react";
import socketIOClient from "socket.io-client";


function App() {
  const [device, setDevice] = useState("");
  const [message,setMessage] = useState("")
  const [socket,setSocket] = useState("")
  const [serverport,setServerport] = useState(8000)
  
  const handleSubmit = (evt) => {
    evt.preventDefault();
    if (socket) {
      console.log("Close old socket")
      socket.close();
      setSocket({})
    }
    const s1 = socketIOClient(`http://localhost:${serverport}`, {
            query: { token: device }
        });
    setSocket(s1)
    s1.on('devicedata',msg =>  {
      setMessage(msg)
  });
    
}
  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
      <label>
        Device
        <input
          type="text"
          value={device}
          onChange={e => setDevice(e.target.value)}
        />
      </label>
      <label>
        Port
        <select
          type="text"
          value={serverport}
          onChange={e => setServerport(e.target.value)}          
        >
          <option value="8000">express 8000</option>
          <option value="9000">express 9000</option>
          <option value="8080">nginx LB 8080</option>
          </select>
      </label>
      <input type="submit" value="Connect" />
    </form>
    <p> Last message for device {device} : {message}</p>
    </div>
  );
}

export default App;

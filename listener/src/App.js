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
    const address = (serverport === "443") ? 'wss://demomittaus.fi':`ws://demomittaus.fi:${serverport}`
    const s1 = socketIOClient(address, {
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
          <option value="8000">http/ws (non secure) app A port 8000</option>
          <option value="9000">http/ws (non secure) app B port 9000</option>
          <option value="8080">http/nginx load balancher port 8080</option>
          <option value="443">http/2 (firefox) wss on port 443</option>
          </select>
      </label>
      <input type="submit" value="Connect" />
    </form>
    <p> Last message for device {device} : {message}</p>
    </div>
  );
}

export default App;

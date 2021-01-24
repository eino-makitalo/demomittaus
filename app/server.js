// following example in https://socket.io/get-started/chat/

const fs = require('fs')
const app = require('express')();
var cors = require('cors');
const http = require('http').Server(app);
const io = require('socket.io')(http,{
    cors: {
        origin: ["http://localhost:3000","http://localhost:8080"],
      }
});
const redis = require('socket.io-redis');
io.adapter(redis({ host: 'redis', port: 6379 }));

const SERVERPORT=process.env.SERVERPORT  || "8000"
var bodyParser = require('body-parser')

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    var data = fs.readFileSync(__dirname + '/index.html', 'utf8');
    if (SERVERPORT!=="8000") {
        data=data.replace("8000",SERVERPORT)
    }
    res.send(data)
});

//see: https://stackoverflow.com/questions/36788831/authenticating-socket-io-connections-using-jwt
io.use(function (socket, next) {
    console.log("auth layer ",socket.handshake.query)
    if (socket.handshake.query && socket.handshake.query.token) {

        // In real world we have jwt ticket to include device id
        // and right to read or write messages

        /*jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function(err, decoded) {
          if (err) return next(new Error('Authentication error'));
          socket.decoded = decoded;
          next();
        });*/
        socket.device = socket.handshake.query.token
        socket.sender = socket.handshake.query.sender
        console.log("Device asked is ", socket.device)
        next();
    }
    else {
        console.log("auth error ")
        next(new Error('Authentication error'));
    }
})
io.on('connection', (socket) => {
    console.log('a user connected to device ', socket.device);
    socket.join(socket.device);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        console.log(socket.rooms);
    });
    socket.on('devicecommand', (msg) => {
        console.log('device command for device',socket.device,' command: ', msg);
    });
    socket.on('devicedata', (msg) => {
        console.log('message: ' + msg);
        if (socket.sender) {
            io.to(socket.device).emit('devicedata', msg);
        } else {
            console.error("Listener cannot send in room", socket.device)
        }
    });
});

app.post('/status/:deviceId', (req, res) => {
    // normal access control here of course (not implemented)
    const deviceId = req.params.deviceId;
    const data=JSON.stringify(req.body);
    console.log("About to send ",data, "device Id ",deviceId)
    io.to(deviceId).emit('devicedata',data)
    console.log("Done")
    res.status(204).send()

});


http.listen(SERVERPORT, () => {
    console.log(`listening on *:${SERVERPORT}`);
});


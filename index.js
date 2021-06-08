let app = require("express")();
let cors = require('cors');
let bodyParser = require('body-parser');
// let jsonParser = bodyParser.json();
let http = require("http").createServer(app);
let io = require("socket.io")(http, {
    cors: {
        origin: "*",
    }
});
app.use(cors());

const GameService = require("./game-service.js").default;

var rooms = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


io.on("connection", socket => {

    socket.on("hey", () => {
        console.log('hey');
        socket.emit('hello', 'hello');
    });

    socket.on("disconnect", function() {
    //   let room = rooms.first(r => r.game.players.first(p => p.socketId === socket.id));
        console.log('disconnected');
    });
});

const port = process.env.PORT || 5000;
http.listen(port, () => {
    console.log(`started on port ${port}`);
  });
  
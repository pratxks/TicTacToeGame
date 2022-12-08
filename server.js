const http = require("http")
const express = require("express");
const app = express();
const socketIo = require("socket.io");
const fs = require("fs");

const server = http.Server(app).listen(8080);
const io = socketIo(server);
const clients = {};

// Server static resources
app.use(express.static(__dirname));
app.use(express.static(__dirname + "/node_modules/"));

app.get("/", (req, res) => {
    const stream = fs.createReadStream(__dirname + "tictactoe.html");
    stream.pipe(res);
});

var players = {}; 
var playerexist;

//main event handler for socket connect handling
io.on("connection", function (socket)
{
    let id = socket.id;

    console.log("New Player Joined. ID: ", socket.id);

    clients[socket.id] = socket;

    //handling disconnect event of socket 
    socket.on("disconnect", () => {
        console.log("ID of Left Player: ", socket.id);
        delete clients[socket.id];
        socket.broadcast.emit("clientdisconnect", id);
    });

    join(socket);

    if (otherPlayer(socket))
    {
        console.log("startToPlay to emitted:");

        // emitting start to play event
        socket.emit("startToPlay",
        {
            symbol: players[socket.id].symbol
        });

        otherPlayer(socket).emit("startToPlay",
        {
            symbol: players[otherPlayer(socket).id].symbol 
        });
    }

    // handling player clicking event for perticular cell
    socket.on("playerClicking", function (data)
    {
        if (!otherPlayer(socket))
        {
            return;
        }

        //emitting player clicked event with player data for start palyer
        socket.emit("playerClicked", data);

        //emitting player clicked event with player data for other player
        otherPlayer(socket).emit("playerClicked", data);
    });

    //handling disconnect event for player left the game
    socket.on("disconnect", function ()
    {
        if (otherPlayer(socket))
        {
            otherPlayer(socket).emit("playerLeftGame");
        }
    });
});

function join(socket)
{
    players[socket.id] =
    {
        otherplayer: playerexist,
        symbol: "X",
        socket: socket
    };

    //If 'playerexist' is non null means one player exists and waiting for other player
    if (playerexist)
    { 
        players[socket.id].symbol = "O";
        players[playerexist].otherplayer = socket.id;
        playerexist = null;
    }
    else
    {
        //If 'playerexist' is null it means first player came to play
        playerexist = socket.id;
    }
}

//function for other player socket
function otherPlayer(socket)
{
    if (!players[socket.id].otherplayer)
    {
        return;
    }

    return players[players[socket.id].otherplayer].socket;
}
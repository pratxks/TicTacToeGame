const url = window.location.origin;
let socket = io.connect(url);

var player1 = true;
var symbol;

function getGameCurrentState()
{
    var obj = [];

    obj.push(document.getElementById("square1").value);  //0
    obj.push(document.getElementById("square2").value);  //1
    obj.push(document.getElementById("square3").value);  //2
    obj.push(document.getElementById("square4").value);  //3
    obj.push(document.getElementById("square5").value);  //4
    obj.push(document.getElementById("square6").value);  //5
    obj.push(document.getElementById("square7").value);  //6
    obj.push(document.getElementById("square8").value);  //7
    obj.push(document.getElementById("square9").value);  //8

    return obj;
}

//checking for game over when row or coulmn or digonal having same symbol
function isGameOver()
{
    var state = getGameCurrentState();

    if(((state[0] + state[1] + state[2]) == "XXX") || ((state[0] + state[1] + state[2]) == "OOO")) return true;
    if(((state[3] + state[4] + state[5]) == "XXX") || ((state[3] + state[4] + state[5]) == "OOO")) return true;
    if(((state[6] + state[7] + state[8]) == "XXX") || ((state[6] + state[7] + state[8]) == "OOO")) return true;
    if(((state[0] + state[3] + state[6]) == "XXX") || ((state[0] + state[3] + state[6]) == "OOO")) return true;
    if(((state[1] + state[4] + state[7]) == "XXX") || ((state[1] + state[4] + state[7]) == "OOO")) return true;
    if(((state[2] + state[5] + state[8]) == "XXX") || ((state[2] + state[5] + state[8]) == "OOO")) return true;
    if(((state[0] + state[4] + state[8]) == "XXX") || ((state[0] + state[4] + state[8]) == "OOO")) return true;
    if(((state[2] + state[4] + state[6]) == "XXX") || ((state[2] + state[4] + state[6]) == "OOO")) return true;

    return false;
}

//checking for game tie if all rows and columns occupied but no contineous same symbols appear in
//row or column or diagonal
function isGameTie()
{
    var state = getGameCurrentState();

    var tieresult = state[0] + state[1] + state[2] + state[3] + state[4] + state[5] + state[6] + state[7] + state[8];

    if (tieresult.length == 9) return true;

    return false;
}

//displaying players turn message in respective browser client windows
//also makes perticular player unclicable by diabling all squares on client window
function playerTurnMessage()
{
    if (!player1)
    {
        document.getElementById("message").innerHTML = "Other Players Turn";

        changeButtonState(true);
    }
    else
    {
        document.getElementById("message").innerHTML = "Player1 Turn";

        changeButtonState(false);
    }
}

//event for handling player click
function playerClick(e)
{
    if (!player1)
    {
        return;
    }

    console.log("Clicked Player " + $(this).attr("id"));

    if ($(this).text().length)
    {
        return;
    }

    console.log("Player Clicking");

    socket.emit("playerClicking",
    {
        symbol: symbol,
        position: $(this).attr("id")
    });
}

// Bind event on players move
socket.on("playerClicked", function (data)
{
    document.getElementById(data.position).value = data.symbol;

    player1 = data.symbol !== symbol;

    if (isGameTie())
    {
        if (player1) {
            document.getElementById("message").innerHTML = "Game Ties.";
        }
        else {
            document.getElementById("message").innerHTML = "Game Ties";
        }

        changeButtonState(true);
    }
    else if (!isGameOver())
    {
        playerTurnMessage();
    }
    else 
    {
        if (player1) {
            document.getElementById("message").innerHTML = "You lost.";
        }
        else {
            document.getElementById("message").innerHTML = "You won!";
        }

        changeButtonState(true);
    }
});

//making client window squares enable or disable
function changeButtonState(buttonState)
{
    document.getElementById("square1").disabled = buttonState;
    document.getElementById("square2").disabled = buttonState;
    document.getElementById("square3").disabled = buttonState;
    document.getElementById("square4").disabled = buttonState;
    document.getElementById("square5").disabled = buttonState;
    document.getElementById("square6").disabled = buttonState;
    document.getElementById("square7").disabled = buttonState;
    document.getElementById("square8").disabled = buttonState;
    document.getElementById("square9").disabled = buttonState;
}

//adding click event for each sqaure in client window
function addClickEventToButton(buttonState)
{
    document.getElementById("square1").addEventListener('click', playerClik);
    document.getElementById("square2").addEventListener('click', playerClik);
    document.getElementById("square3").addEventListener('click', playerClik);
    document.getElementById("square4").addEventListener('click', playerClik);
    document.getElementById("square5").addEventListener('click', playerClik);
    document.getElementById("square6").addEventListener('click', playerClik);
    document.getElementById("square7").addEventListener('click', playerClik);
    document.getElementById("square8").addEventListener('click', playerClik);
    document.getElementById("square9").addEventListener('click', playerClik);
}                                  

//handling start to play event emmited by one of the players socket
socket.on("startToPlay", function (data)
{
    symbol = data.symbol;
    player1 = symbol === "X";

    playerTurnMessage();
});

//handling player left the game event emitted by socket
socket.on("playerLeftGame", function ()
{
    document.getElementById("message").value = "Player Left the Game";

    changeButtonState(true);
});

//anonimous function to initialize client window disabled for click and intializing 
//click event handlers for each square in client window
$(function ()
{
    changeButtonState(true);

    $(".board> input").on("click", playerClick);
});

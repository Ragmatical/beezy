var context = $canvas.getContext('2d');
var gamePieces = {};
var gameItems = [];
var itemPath = '/img/apple.png'
var itemImage = new Image();
itemImage.onload = createItems;
itemImage.src = itemPath;


socket.on('playerUpdate', updatePlayers);
socket.on('Dubs', winner);
function updatePlayers(players) {
  var playerNames = Object.keys(players);
  playerNames.forEach(function(playerName) {
    var isZombie = players[playerName].zombie
    if (playerName === user) {
      gamePieces[user].zombie = isZombie;
      return;
    }
    if (!gamePieces[playerName]) {
      createNewPlayer(playerName);
    }
    var player = players[playerName];
    var gamePiece = gamePieces[playerName];
    gamePiece.x = player.x;
    gamePiece.y = player.y;
    gamePiece.zombie = isZombie
  })

  var gamePiecesNames = Object.keys(gamePieces);
  gamePiecesNames.forEach(function(gamePieceName) {
      if (!players[gamePieceName]) {
        delete gamePieces[gamePieceName];
      };
  });
}
var winnertimes = 0
function winner(winners) {
  winnertimes++ ;
  if(winnertimes<1) {
    alert(winners)
  }

}


function createNewPlayer(playerName) {
  var gamePiece = {
    loaded: false,
    x: $canvas.width/2,
    y: $canvas.height/2,
  };
  gamePiece.avatar = new Image();
  gamePiece.avatar.onload = function() {
    gamePiece.loaded = true;
  }
  gamePiece.avatar.src = '/picture/' + playerName;
  gamePieces[playerName] = gamePiece;
}

function drawGamePiece() {
  var playerNames = Object.keys(gamePieces);
  var pieceWidth = Math.min($canvas.width, $canvas.height) / 20;
  playerNames.forEach(function(playerName) {
    var gamePiece = gamePieces[playerName];
    if (!gamePiece.loaded) return;
    context.drawImage(
      gamePiece.avatar, gamePiece.x, gamePiece.y, pieceWidth, pieceWidth
    );
    if (gamePiece.zombie) {
      context.beginPath();
      context.strokeStyle = "green";
      context.linewidth = 10;
      context.rect(gamePiece.x-pieceWidth*0.25, gamePiece.y-pieceWidth*0.25, pieceWidth*1.5, pieceWidth*1.5)
      context.stroke();
    } else {
      context.beginPath();
      context.strokeStyle = "yellow"
      context.linewidth = 10;
      context.rect(gamePiece.x-pieceWidth*0.25, gamePiece.y-pieceWidth*0.25, pieceWidth*1.5, pieceWidth*1.5)
      context.stroke();
    };
  });
}

function animate() {
  context.clearRect(0, 0, $canvas.width, $canvas.height);
  drawGamePiece();
  drawItems();
  window.requestAnimationFrame(animate);
}

function updatePlayerPosition(e) {
  var gamePiece = gamePieces[user];
  var xStep = $canvas.width/25
  var yStep = $canvas.height/25
  switch (e.key) {
    case 'ArrowLeft':
      gamePiece.x=gamePiece.x-xStep;
      break;
    case 'ArrowRight':
      gamePiece.x=gamePiece.x+xStep;
      break;
    case 'ArrowDown':
      gamePiece.y=gamePiece.y+yStep;
      break;
    case 'ArrowUp':
      gamePiece.y=gamePiece.y-yStep;
      break;
    default:
      break;
  }
  collide();
  socket.emit('playerUpdate', {
    x: gamePiece.x,
    y: gamePiece.y,
    zombie: gamePiece.zombie,
    user: user
  });

}

var mainPlayer = gamePieces[user]
Object.keys(gamePieces).forEach(function(player) {
  if(player === user) return;
  var otherPlayer = gamePieces[player];
})

socket.on("time", runTimer)

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {sec = "0" + sec}; // add zero in front of numbers < 10
  if (sec < 0) {sec = "59"};
  return sec;

}

function drawBarriers(){}

function earnPoints(){}

function createSoundEffects(){}

function createItems(){
  var x = parseInt(Math.random()*100);
  var y = parseInt(Math.random()*100);
  gameItems.push({x,y})
  setTimeout(createItems, 5000+Math.random()*10000);
  setTimeout(function(){gameItems.shift()}, 10000);
}

function drawItems(){
  var itemWidth = Math.min($canvas.width, $canvas.height) / 30;
  gameItems.forEach(function(gameItem) {
    context.drawImage(
      itemImage, gameItem.x, gameItem.y, itemWidth, itemWidth
    );

  });
}

function runTimer(timer){
  document.querySelector("#timer").innerHTML = timer
}

function collide(){
  var pieceWidth = Math.min($canvas.width, $canvas.height) / 20;
  var mainPlayer = gamePieces[user]
  Object.keys(gamePieces).forEach(function(player) {
    if(player === user) return;
    var otherPlayer = gamePieces[player];
    var mainPlayerLeft = mainPlayer.x;
    var mainPlayerRight = mainPlayer.x + pieceWidth;
    var mainPlayerTop = mainPlayer.y;
    var mainPlayerBottom = mainPlayer.y + pieceWidth;
    var otherPlayerLeft = otherPlayer.x;
    var otherPlayerRight = otherPlayer.x + pieceWidth;
    var otherPlayerTop = otherPlayer.y;
    var otherPlayerBottom = otherPlayer.y + pieceWidth;
    var upperLeftCollides = otherPlayerLeft <= mainPlayerLeft && mainPlayerLeft <= otherPlayerRight
                            && otherPlayerTop <= mainPlayerTop && mainPlayerTop <= otherPlayerBottom;
    var upperRightCollides = otherPlayerLeft <= mainPlayerRight && mainPlayerRight <= otherPlayerRight
                            && otherPlayerTop <= mainPlayerTop && mainPlayerTop <= otherPlayerBottom;
    var lowerLeftCollides = otherPlayerLeft <= mainPlayerLeft && mainPlayerLeft <= otherPlayerRight
                            && otherPlayerTop <= mainPlayerBottom && mainPlayerBottom <= otherPlayerBottom;
    var lowerRightCollides = otherPlayerLeft <= mainPlayerRight && mainPlayerRight <= otherPlayerRight
                            && otherPlayerTop <= mainPlayerBottom && mainPlayerBottom <= otherPlayerBottom;
    if(upperLeftCollides || upperRightCollides || lowerLeftCollides ||lowerRightCollides){
      playerCollision(mainPlayer, otherPlayer);
    }
  });
};

function playerCollision(mainPlayer, otherPlayer) {
    if(otherPlayer.zombie === true){
      mainPlayer.zombie = true;
    }
    else if(mainPlayer.zombie === true){

      otherPlayer.zombie = true;
    }
    else{
      return;
    }
};


window.requestAnimationFrame(animate);
createNewPlayer(user);
document.body.addEventListener('keydown', updatePlayerPosition);

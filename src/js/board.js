const board = (() => {

    class Position{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }


    const api = apiClient;
    const session = sessionStorage.getItem('session');
    /*let state = null;

    /* Escucha el evento `beforeunload` para detectar cuando el usuario intenta salir de la página.
    window.addEventListener('beforeunload', async (event) => {
        await board.exitFromGameSession();
    });

    // Escucha el evento `popstate` para detectar cambios en el historial, como cuando se presiona el botón "Atrás".
    window.addEventListener('popstate', async (event) => {
        await board.exitFromGameSession();
    });
    */
    const handleKeydown = (e) => {
        switch(e.key) {
            case 'a':
                createPositionFromMovement('LEFT');
                break;
            case 'd':
                createPositionFromMovement('RIGHT');
                break;
            case 'w':
                createPositionFromMovement('UP');
                break;
            case 's':
                createPositionFromMovement('DOWN');
                break;
        }
    };


    //MOVEMENTS LISTENERS
    document.addEventListener('DOMContentLoaded', (event) => {
        board.initializeBoard();
    });

    document.addEventListener('keydown', handleKeydown);
    
    const initializeBoard = async () => {
        try {
            const boardArray = await api.getGameSessionBoard("1"); // Esperar a que la promesa se resuelva
            generateBoard(boardArray);
        } catch (error) {
            console.log("Error al obtener el tablero de la sesión:", error.responseJSON.error);
        }
    }

    const generateBoard = (boardArray) => {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) {
            console.log("El elemento game-board no se encontró en el DOM");
            return;
        }

        // Limpiar el tablero antes de generarlo
        gameBoard.innerHTML = '';
        boardArray.forEach(row => {
            row.forEach(cell => {
                const cellDiv = document.createElement('li');
                cellDiv.classList.add('cell');

                switch (cell) {
                    case '.':
                        cellDiv.classList.add('empty');
                        break;
                    case '#':
                        cellDiv.classList.add('wall');
                        cellDiv.innerText = '🧱';
                        break;
                    case 'B':
                        cellDiv.classList.add('box');
                        cellDiv.innerText = '📦'; 
                        break;
                    case 'T':
                        cellDiv.classList.add('goal');
                        cellDiv.style.backgroundColor = 'yellow'; 
                        break;
                    case 'P':
                        cellDiv.classList.add('player');
                        cellDiv.innerText = '😃';
                        break;
                    case 'BT':
                        cellDiv.classList.add('boxtarget');
                        cellDiv.innerText = '📦';
                        cellDiv.style.backgroundColor = 'yellow'; 
                        break;
                    case 'PT':
                        cellDiv.classList.add('playertarget');
                        cellDiv.innerText = '😃';
                        cellDiv.style.backgroundColor = 'yellow'; 
                        break;
                }
                gameBoard.appendChild(cellDiv);
            });
        });
    }

    const createPositionFromMovement = async (direction) => {
        let newPosX = 0;
        let newPosY = 0;

        switch (direction) {
            case 'LEFT':
                newPosX -= 1;
                break;
            case 'RIGHT':
                newPosX += 1;
                break;
            case 'UP':
                newPosY -= 1;
                break;
            case 'DOWN':
                newPosY += 1;
                break;
            default:
                console.log('Dirección inválida:', direction);
                return;

        }
        let position = new Position(newPosX, newPosY)
        movePlayer(position)
    
    };

    const movePlayer = async (position) => {
        try {
            await stompClient.send("/app/sessions/move." + session, {}, JSON.stringify({ 
                nickname: getDisplayName(),
                position: { 
                    x: position.x, 
                    y: position.y 
                }}));
        } catch (error) {
            console.log("Error al mover el jugador:", error.responseJSON.error);
        }
    };

    //PLAYERS PANEL FUNCIONALITY

    const initializeGameSession = async () => {
        try {
            if (!getDisplayName()|| !session) {
                console.log("Nickname o Game Session ID no encontrados.");
                return;
            }
            await updatePlayerList(session);
        } catch (error) {
            console.log(error.responseJSON.error);
        }
    };

    const updatePlayerList = async (session) => {
        try {
            const players = await api.getPlayersInSession(session);
            const playerList = document.getElementById("player-list");

            const existingNicknames = Array.from(playerList.children).map(item => item.textContent);
            
            const newNicknames = players.map(player => player.nickname);
            const hasChanges = existingNicknames.length !== newNicknames.length ||
                !newNicknames.every(nickname => existingNicknames.includes(nickname));

            if (!hasChanges) return;
            playerList.innerHTML = "";
            players.forEach(player => {
                const listItem = document.createElement("li");
                listItem.textContent = player.nickname;
                playerList.appendChild(listItem);
            });
        } catch (error) {
            console.error(error.responseJSON.error);
        }
    };

    const exitFromGameSession = async () => {
        try {
            await api.removePlayerFromSession(session, getDisplayName());
            await stompClient.send("/app/sessions", {});
            await stompClient.send("/app/sessions/enterOrExitSession." + session, {});
            unsubscribe();
            sessionStorage.removeItem('session');
            window.location.href = "./sessionMenu.html";
        } catch (error) {
            console.log(error.responseJSON.error);
        }
    };

    const enterSession = () => {
        return stompClient.send("/app/sessions/enterOrExitSession." + session, {}); 
    };

    //STOMP FUNCTIONS
    let stompClient = null;
    let subscription = null;

    const connectAndSubscribe = async function () {
        await new Promise((resolve, reject) => {
            console.info('Connecting to WS...');
            let socket = new SockJS('https://pollos2-g3ddfmbndvhceqbe.eastus-01.azurewebsites.net/stompendpoint');
            //let socket = new SockJS('http://localhost:8080/stompendpoint');
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            subscription = stompClient.subscribe('/topic/sessions/' + session + "/move", function (eventbody) {
                initializeBoard();
            });

            subscription = stompClient.subscribe('/topic/sessions/' + session + "/updatePlayerList", function (eventbody) {
                updatePlayerList(session);
            });

            subscription = stompClient.subscribe('/topic/sessions/' + session + "/updateBoard", function (eventbody) {
                initializeBoard();
            });
              
            subscription = stompClient.subscribe('/topic/sessions/' + session + "/gameWon", function (eventbody) {
                const gameStatus = eventbody.body;
                handleGameStatus(gameStatus);
            });
            resolve();
            }, function (error) {
            reject(error);
            console.log("STOMP error");
            });
        });
    };

    const unsubscribe = () => {
        if (subscription !== null) {
            subscription.unsubscribe();
        }
        console.log("Unsubscribed from the gameSession Topic");
    };

    const initGameSession = async () => {
        connectAndSubscribe()
        .then(() => initializeGameSession())
        .then(() =>enterSession());
    };

    // GANAR
    const handleGameStatus = (status) => {
        if (status) {
            showWinModal();
            disableMovements();
        }
    };

    const showWinModal = () => {
        const modal = document.getElementById('winModal');
        modal.style.display = 'flex';
    };

    const disableMovements = () => {
        const controls = document.getElementById('controls');
        if (controls) {
            controls.style.pointerEvents = 'none';
            controls.style.opacity = '0.5';
        }
        document.removeEventListener('keydown', handleKeydown);
    };

    const exitAfterWinning = async () => {
        await api.removePlayerFromSession(session, getDisplayName());
        await stompClient.send("/app/sessions", {});
        sessionStorage.removeItem('session');
        window.location.href = "./sessionMenu.html";
    }

    
    const getDisplayName = () => {
        return sessionStorage.getItem("nickname"); 
    };

    return {
        init: function(){
            initGameSession();
        },
        createPositionFromMovement,
        movePlayer,
        initializeBoard,
        exitFromGameSession,
        initializeGameSession,
        exitAfterWinning,
        getDisplayName
    };


})();
board.init();

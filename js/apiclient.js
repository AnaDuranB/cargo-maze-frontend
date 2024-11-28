/*
await se utiliza para esperar a que la promesa devuelta por fetch
se resuelva, es decir, esperar a que los datos lleguen del servidor.
*/

const apiClient = (() => {


    //const url = "http://localhost:8080/cargoMaze/";
    const url = "https://cargo-maze-backend-hwgpaheeb7hreqgv.eastus2-01.azurewebsites.net/cargoMaze/"
    
    //GET

    const getGameSessionBoard = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/board/state`);
        return await response.json();
    }

    const getGameSessionState = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/state`);
        return await response.json();
    }

    const getPlayersInSession = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/players`);
        return await response.json();
    };

    const getPlayerCountInSession = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/players/count`);
        return await response.json();
    };

    //POST

    const login = async (nickname) => {
        let json = JSON.stringify({ nickname: nickname });
        let promise = $.ajax({
            url: url + "players",
            type: "POST",
            data: json,
            contentType: "application/json"
        })
        return promise;
    };

    //PUT

    const enterSession = async (gameSessionId, nickname) => {
        let json = JSON.stringify({ nickname: nickname });
        let response = await $.ajax({
            url: url + "sessions/" + gameSessionId + "/players",
            type: 'PUT',
            data: json,
            contentType: "application/json"
        });
        return response; // Return the response to the caller
    };


    const movePlayer = async (gameSessionId, nickname, newPosition) => {
        let json = JSON.stringify({ "x": newPosition.x, "y": newPosition.y });
        let response = await $.ajax({
            url: url + "sessions/" + gameSessionId + "/players/" + nickname + "/move",
            type: 'PUT',
            data: json,
            contentType: "application/json"
        });
        return response; // Return the response to the caller

    };

    const resetGameSession = async (gameSessionId) => {
        let json = JSON.stringify({ gameSessionId: gameSessionId });
        let response = await $.ajax({
            url: url + "sessions/" + gameSessionId + "/reset",
            type: 'PUT',
            data: json,
            contentType: "application/json"
        });
        return response; // Return the response to the caller
    };


    //DELETE

    const removePlayerFromSession = async (gameSessionId, nickname) => {
        let json = JSON.stringify({ nickname: nickname, gameSessionId: gameSessionId });
        let response = await $.ajax({
            url: url + "sessions/" + gameSessionId + "/players/" + nickname,
            type: 'DELETE',
            data: json,
            contentType: "application/json"
        });
        console.log(response); // Log successful response
        return response; // Return the response to the caller
    }

    return {
        login,
        getGameSessionBoard,
        getGameSessionState,
        enterSession,
        getPlayersInSession,
        movePlayer,
        removePlayerFromSession,
        getPlayerCountInSession,
        resetGameSession
    };

})();
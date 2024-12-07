/*
await se utiliza para esperar a que la promesa devuelta por fetch
se resuelva, es decir, esperar a que los datos lleguen del servidor.
*/

const apiClient = (() => {


    //const url = "http://localhost:8080/cargoMaze/";
    // const url = "https://cargo-maze-backend-hwgpaheeb7hreqgv.eastus2-01.azurewebsites.net/cargoMaze/"
    const url = "http://localhost:8080/cargoMaze/";

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
        let response = await fetch(url + "players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: json
        });
        return await response.json();
    };

    // const microsoftAuth = async (code) => {
    //     let response = await fetch(`${url}auth/callback?code=${encodeURIComponent(code)}`, {
    //         method: 'GET'
    //     });
    //     return await response.json();
    // };

    const getCorrectInfo = async () => {
        try {
            // Realizar la solicitud al backend
            let response = await fetch(`${url}correct`);
            
            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                throw new Error('No se pudo obtener la información de autenticación');
            }
    
            // Parsear la respuesta como JSON
            let userInfo = await response.json();
    
            // Acceder a los valores del JSON
            const { displayName, userPrincipalName, token } = userInfo;
    
            // Verificar si los datos existen y procesarlos
            if (displayName && userPrincipalName && token) {
                console.log("regresamos usuario.");
                return userInfo;
            } else {
                console.warn("Datos de autenticación no encontrados en la respuesta.");
            }
        } catch (error) {
            console.warn("Error al obtener información de autenticación: ", error);
        }
    };
    

    
    const parseXMLToJSON = (xmlString) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
        // Asegurémonos de que los elementos existen antes de intentar obtener sus valores
        const displayNameNode = xmlDoc.getElementsByTagName("displayName")[0];
        const userPrincipalNameNode = xmlDoc.getElementsByTagName("userPrincipalName")[0];
        const tokenNode = xmlDoc.getElementsByTagName("token")[0];
    
        // Si los nodos no existen, retornamos valores vacíos o null
        return {
            displayName: displayNameNode ? displayNameNode.textContent : null,
            userPrincipalName: userPrincipalNameNode ? userPrincipalNameNode.textContent : null,
            token: tokenNode ? tokenNode.textContent : null
        };
    };
    
    // PUT

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

    // verificar nickname
    const verifyNickname = async (nickname) => {
        try {
            let response = await fetch(`${url}players/${nickname}`);
            if (!response.ok) {
                throw new Error('Nickname no disponible');
            }
            return await response.json();
        } catch (error) {
            return null;
        }
    };


    return {
        login,
        getGameSessionBoard,
        getGameSessionState,
        enterSession,
        getPlayersInSession,
        movePlayer,
        removePlayerFromSession,
        getPlayerCountInSession,
        resetGameSession,
        verifyNickname,
        getCorrectInfo 
    };

})();
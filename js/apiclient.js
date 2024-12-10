// Configuración de MSAL
const msalConfig = {
    auth: { 
        clientId: "bd798536-2348-457e-b5d8-1a138c147eab",
        authority: "https://login.microsoftonline.com/ac3a534a-d5d6-42f6-aa4f-9dd5fbef911f",
        redirectUri: "http://localhost:4200/sessionMenu.html", // Asegúrate de que esta URL esté registrada en Azure
    },
    cache: {
        cacheLocation: "sessionStorage",  // Usamos sessionStorage para persistencia temporal
        storeAuthStateInCookie: false,   // No almacenar el estado de autenticación en cookies
    },
};
const msalInstance = new msal.PublicClientApplication(msalConfig);
console.log("instancua msal",msalInstance);
window.msalInstance = msalInstance;
console.log("window ", window.msalInstance);

const apiClient = (() => {

    const loginWithMicrosoft = async () => {
        try {
            // Inicia la redirección de login
            await msalInstance.loginRedirect({
                scopes: ["openid", "profile", "email"]
            })
            console.log("Redirección iniciada correctamente.");
        } catch (error) {
            console.error("Error durante la autenticación: ", error);
        }
    };

    const url = "http://localhost:8080/cargoMaze/";
    //const url = "https://cargo-maze-backend-hwgpaheeb7hreqgv.eastus2-01.azurewebsites.net/cargoMaze/"
    // const url = "https://proyectoarsw.duckdns.org/cargoMaze/";

    const getAccessToken = async () => {
        // Asegúrate de que window.msalInstance exista
        if (!msalInstance) {
            console.error("MSAL instance not initialized");
            throw new Error("MSAL instance is not available");
        }
    
        const accounts = window.msalInstance.getAllAccounts();
        if (accounts.length === 0) {
            throw new Error("No se encontró ninguna cuenta autenticada.");
        }
    
        const account = accounts[0];
        const tokenRequest = {
            scopes: ["openid", "profile", "email"],
            account: account,
        };
    
        try {
            const tokenResponse = await window.msalInstance.acquireTokenSilent(tokenRequest);
            return tokenResponse.accessToken;
        } catch (error) {
            console.error("Error al obtener el token:", error);
            
            if (error.name === "InteractionRequiredAuthError") {
                // Si se requiere interacción, redirigir a la página de login
                await window.msalInstance.acquireTokenRedirect(tokenRequest);
            } else {
                throw error;
            }
        }
    };
    
    
    //GET

    const getGameSessionBoard = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/board/state`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${await getAccessToken()}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    };

    const getGameSessionState = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/state`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${await getAccessToken()}`,  // Añadimos el token en las cabeceras
                "Content-Type": "application/json",  // Aseguramos el tipo de contenido correcto
            },
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    };
    const getPlayersInSession = async (gameSessionId) => {
        const token = await getAccessToken();
        let response = await fetch(`${url}sessions/${gameSessionId}/players`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  
                "Content-Type": "application/json",  
            },
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    };

    const getPlayerCountInSession = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/players/count`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${await getAccessToken()}`, 
                "Content-Type": "application/json",
            },
            credentials: "include", // Esto asegura que las cookies se envíen
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    };
    

    //POST

    const login = async (nickname) => {
        let json = JSON.stringify({ nickname: nickname });
        let promise = $.ajax({
            url: url + "players",
            type: "POST",
            data: json,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true // Permite enviar cookies en solicitudes CORS
            }

        })
        return promise;
    };

    // PUT

    const enterSession = async (gameSessionId, nickname) => {
        let json = JSON.stringify({ nickname: nickname });
        let response = await $.ajax({
            url: url + "sessions/" + gameSessionId + "/players",
            type: 'PUT',
            data: json,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true // Permite enviar cookies en solicitudes CORS
            }
        });
        return response; // Return the response to the caller
    };


    const movePlayer = async (gameSessionId, nickname, newPosition) => {
        let json = JSON.stringify({ "x": newPosition.x, "y": newPosition.y });
        let response = await $.ajax({
            url: url + "sessions/" + gameSessionId + "/players/" + nickname + "/move",
            type: 'PUT',
            data: json,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true // Permite enviar cookies en solicitudes CORS
            }
        });
        return response; // Return the response to the caller

    };

    const resetGameSession = async (gameSessionId) => {
        let json = JSON.stringify({ gameSessionId: gameSessionId });
        let response = await $.ajax({
            url: url + "sessions/" + gameSessionId + "/reset",
            type: 'PUT',
            data: json,
            contentType: "application/json",
            xhrFields: {
                withCredentials: true // Permite enviar cookies en solicitudes CORS
            }
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
            contentType: "application/json",
            xhrFields: {
                withCredentials: true // Permite enviar cookies en solicitudes CORS
            }
        });
        console.log(response); // Log successful response
        return response; // Return the response to the caller
    }

    // verificar nickname
    const verifyNickname = async (nickname) => {
        try {
            let response = await fetch(`${url}players/${nickname}`, {
                method: "GET",
                credentials: "include", // Esto asegura que las cookies se envíen
            });
            if (!response.ok) {
                throw new Error('Nickname no disponible');
            }
            return await response.json();
        } catch (error) {
            return null;
        }
    };


    return {
        loginWithMicrosoft,
        login,
        getGameSessionBoard,
        getGameSessionState,
        enterSession,
        getPlayersInSession,
        movePlayer,
        removePlayerFromSession,
        getPlayerCountInSession,
        resetGameSession,
        verifyNickname
    };

})();
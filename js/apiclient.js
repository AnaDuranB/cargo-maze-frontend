/*
await se utiliza para esperar a que la promesa devuelta por fetch
se resuelva, es decir, esperar a que los datos lleguen del servidor.
*/

const apiClient = (() => {

    //const url = "http://localhost:8080/cargoMaze/";
    //const url = "https://cargo-maze-backend-hwgpaheeb7hreqgv.eastus2-01.azurewebsites.net/cargoMaze/"
    const url = "http://localhost:8080/cargoMaze/";
     //encryption
    const SECRET_KEY = "TGQ7ZWet0t8WKnhxvse1iA==";


    // FUNCIONES DE CIFRADO

    
    async function decrypt(encryptedDataBase64) {
        try {
            const encryptedData = Uint8Array.from(atob(encryptedDataBase64), c => c.charCodeAt(0));
            const iv = encryptedData.slice(0, 16);  // Obtener el IV (si es necesario)
            const encryptedBytes = encryptedData.slice(16);

            const secretKeyBase64 = SECRET_KEY; 
            const keyBuffer = Uint8Array.from(atob(secretKeyBase64), c => c.charCodeAt(0));

            const aesKey = await crypto.subtle.importKey(
                "raw",
                keyBuffer,
                { name: "AES-CBC" },
                false,
                ["decrypt"]
            );

            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-CBC", iv },
                aesKey,
                encryptedBytes
            );

            const decryptedText = new TextDecoder().decode(decryptedBuffer);
            console.log("Decrypted data:", decryptedText);
            return decryptedText;
        } catch (error) {
            console.error("Error during decryption:", error.message);
            throw new Error("Decryption failed or data is not UTF-8 compliant.");
        }
    }
    
    
    
    // FUNCIONES HTTP

    // POST: Enviar datos en texto claro (sin cifrar)
    async function sendData(data) {
        try {
            const response = await fetch(`${url}test-encryption`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ payload: data }),  // Datos en texto claro
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();

            // Acceder al valor cifrado desde la propiedad "payload"
            if (result.payload) {
                console.log("Encrypted response from server:", result.payload);

                // Si el servidor responde con el campo 'payload', puedes proceder con el descifrado
                const decryptedResponse = await decrypt(result.payload);
                console.log("Decrypted response:", decryptedResponse);
                return decryptedResponse;
            } else {
                console.error("No se recibió el campo 'payload' en la respuesta.");
            }

        } catch (error) {
            console.error("Error sending data:", error.message);
            throw error;
        }
    }
    
    
    //GET

    const getGameSessionBoard = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/board/state`, {
            method: "GET",
            credentials: "include", // Esto asegura que las cookies se envíen
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    };

    const getGameSessionState = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/state`, {
            method: "GET",
            credentials: "include", // Esto asegura que las cookies se envíen
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    };
    const getPlayersInSession = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/players`, {
            method: "GET",
            credentials: "include", // Esto asegura que las cookies se envíen
        });
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return await response.json();
    };

    const getPlayerCountInSession = async (gameSessionId) => {
        let response = await fetch(`${url}sessions/${gameSessionId}/players/count`, {
            method: "GET",
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
        sendData
    };

})();
/*
await se utiliza para esperar a que la promesa devuelta por fetch
se resuelva, es decir, esperar a que los datos lleguen del servidor.
*/

const apiClient = (() => {

    //const url = "http://localhost:8080/cargoMaze/";
    //const url = "https://cargo-maze-backend-hwgpaheeb7hreqgv.eastus2-01.azurewebsites.net/cargoMaze/"
    const url = "http://localhost:8080/cargoMaze/";
     //encryption
    const SECRET_KEY = "clave-super-secreta";
    const IV = "1234567890123456";

    function generateKey(key) {
        const hashedKey = CryptoJS.SHA256(key);
        return CryptoJS.enc.Utf8.parse(hashedKey.toString(CryptoJS.enc.Base64).substring(0, 16));
    }

    // FUNCIONES DE CIFRADO

    function encrypt(data) {
        const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
        const iv = CryptoJS.enc.Utf8.parse(IV);
        return CryptoJS.AES.encrypt(data, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString();
    }
    
    function decrypt(encryptedData) {
        try {
            const SECRET_KEY = "clave-super-secreta";
            const IV = "1234567890123456";
    
            // Hash the key using SHA-256 and take the first 16 bytes
            const hashedKey = CryptoJS.SHA256(SECRET_KEY);
            const key = CryptoJS.enc.Hex.parse(hashedKey.toString().substr(0, 32));
            const iv = CryptoJS.enc.Utf8.parse(IV);
    
            // Directly use AES decrypt method
            const decrypted = CryptoJS.AES.decrypt(
                encryptedData, 
                key, 
                { 
                    iv: iv, 
                    mode: CryptoJS.mode.CBC, 
                    padding: CryptoJS.pad.Pkcs7 
                }
            );
    
            // Convert to UTF-8 string
            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
            console.log("Decryption Details:");
            console.log("Encrypted Data:", encryptedData);
            console.log("Key:", key);
            console.log("IV:", iv);
            console.log("Decrypted Text:", decryptedText);
    
            if (!decryptedText) {
                throw new Error("Decryption resulted in empty string");
            }
    
            return decryptedText;
        } catch (error) {
            console.error("Detailed Decryption Error:", error);
            console.error("Error Name:", error.name);
            console.error("Error Message:", error.message);
            return null;
        }
    }
    
    

    // FUNCIONES HTTP

    // POST: Enviar datos cifrados
    async function sendEncryptedData(data) {
        try {
            const encryptedData = encrypt(data);
            const response = await fetch(`${url}test-encryption`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ payload: encryptedData }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
    
            // Acceder al valor cifrado desde la propiedad "payload"
            if (result.payload) {
                console.log("Encrypted response from server:", result.payload);
    
                // Si el servidor responde con el campo 'payload', puedes proceder con el descifrado
                const decryptedResponse = decrypt(result.payload);
                console.log("Decrypted response:", decryptedResponse);
                return decryptedResponse;
            } else {
                console.error("No se recibió el campo 'payload' en la respuesta.");
            }
    
        } catch (error) {
            console.error("Error sending encrypted data:", error.message);
            throw error;
        }
    }
    
    async function sendDecryptedData(encryptedData) {
        await fetch(`${url}test-decryption`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payload: encryptedData })
        })
        .then(response => response.json())
        .then(responseData => {
            console.log("Datos descifrados desde el servidor:", responseData.decryptedData);
        })
        .catch(error => {
            console.error("Error al descifrar los datos:", error);
        });
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
        sendEncryptedData
    };

})();
const sessionMenu = (() => {
    let nickname = sessionStorage.getItem('nickname');
    let api = apiClient;
    let stompClient = null;
    let subscription = null;
    let login = login;

    document.addEventListener('DOMContentLoaded', (event) => {
        sessionMenu.updateUserCount();
    });
    const msalInstance = window.msalInstance;

    console.log("instancua msal",msalInstance);


    const enterSession = async (sessionId) => {
        try {
            if (!nickname || nickname.length === 0) {
                alert("No se ha ingresado un nickname");
                return;
            }
            await api.enterSession(sessionId, nickname);
            stompClient.send("/app/sessions", {}); 
            sessionStorage.setItem('session', sessionId);
            window.location.href = "game.html";
        } catch (error) {
            console.log(error);
            alert(error.responseJSON.error);
        }
    };

    let connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        let socket = new SockJS('http://localhost:8080/stompendpoint');
        // let socket = new SockJS('https://cargo-maze-backend-hwgpaheeb7hreqgv.eastus2-01.azurewebsites.net/stompendpoint');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            subscription = stompClient.subscribe('/topic/sessions', function () {
                updateUserCount();
            });
        });
    };

    const initSessionMenu = () => {
        const nickname = sessionStorage.getItem('nickname');
        console.log("Nickname en sessionStorage:", nickname);

        // Verificar si msalInstance existe
        console.log("msalInstance en sessionMenu:", window.msalInstance);

        connectAndSubscribe();
    };

    const updateUserCount = async () => { 
        try {
            const currentUsers = await api.getPlayerCountInSession("1");
            const element = document.getElementById("capacity-1");
            if (element) {
                element.textContent = `${currentUsers}/4`;
            }
        } catch (error) {
            // Verificar si el error tiene una respuesta y loguearlo adecuadamente
            if (error.responseJSON) {
                console.log(error.responseJSON.error);
            } else {
                // Si no hay una respuesta JSON, solo loguear el error general
                console.log("Error al actualizar la cantidad de jugadores: ", error);
            }
        }
    };
    
    

    const unsubscribe = () => {
        if (subscription !== null) {
            subscription.unsubscribe();
        }
        console.log("Unsubscribed from the gameSession Topic");
    };

    return {
        enterSession,
        unsubscribe,
        init: function () {
            initSessionMenu();
        },
        updateUserCount
    };

})();

sessionMenu.init();
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import apiClient from './apiclient'; // Asegúrate de que la importación de apiClient sea correcta.

const sessionMenu = (() => {
    let nickname = sessionStorage.getItem('nickname') || '';
    let api = apiClient;
    let stompClient = null;
    let subscription = null;

    // Se ejecuta al cargar el documento
    document.addEventListener('DOMContentLoaded', () => {
        sessionMenu.updateUserCount(); // Actualiza la cuenta de jugadores al cargar la página
    });

    // Función para entrar a la sesión
    const enterSession = async (sessionId) => {
        try {
            if (!nickname || nickname.length === 0) {
                alert("No se ha ingresado un nickname");
                return;
            }
            await api.enterSession(sessionId, nickname);
            if (stompClient && stompClient.connected) {
                stompClient.send("/app/sessions", {}); // Enviar mensaje al servidor
            }
            sessionStorage.setItem('session', sessionId);
            window.location.href = "game.html"; // Redirige a la página del juego
        } catch (error) {
            console.log(error);
            alert(error.responseJSON?.error || 'Error al entrar a la sesión'); // Muestra un mensaje de error
        }
    };

    // Conectar y suscribirse al WebSocket
    let connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        let socket = new SockJS('http://localhost:8080/stompendpoint'); // URL del servidor
        stompClient = Stomp.over(socket); // Establece la conexión WebSocket
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            // Suscribirse al tema /topic/sessions
            subscription = stompClient.subscribe('/topic/sessions', function () {
                sessionMenu.updateUserCount(); // Actualizar la cuenta de usuarios
            });
        }, function(error) {
            console.error('STOMP connection error:', error);
        });
    };

    // Inicializar la conexión y suscripción al WebSocket
    const initSessionMenu = () => {
        connectAndSubscribe();
    };

    // Actualizar la cuenta de jugadores en la sesión
    const updateUserCount = async () => {
        try {
            const currentUsers = await api.getPlayerCountInSession("1");
            const element = document.getElementById("capacity-1");
            if (element) {
                element.textContent = `${currentUsers.count}/4`; // Actualiza el contador
            }
        } catch (error) {
            console.log(error.responseJSON?.error);
        }
    };

    // Función para desuscribirse del WebSocket
    const unsubscribe = () => {
        if (subscription !== null) {
            subscription.unsubscribe();
            console.log("Unsubscribed from the gameSession Topic");
        }
    };

    // Retorna los métodos públicos para ser utilizados fuera del módulo
    return {
        enterSession,
        unsubscribe,
        init: function () {
            initSessionMenu(); // Inicializa la conexión y suscripción al WebSocket
        },
        updateUserCount,
        _setNickname: function(newNickname) { // Añadido para testing
            nickname = newNickname;
        }
    };
})();

export default sessionMenu;
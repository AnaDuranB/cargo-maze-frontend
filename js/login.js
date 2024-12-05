const login = (() => {
    let nickname = "";
    let api = apiClient;

    document.addEventListener("DOMContentLoaded", function () {
        // Limpiar sesión
        sessionStorage.clear();

        // Verificar si hay parámetros de autenticación de Microsoft
        const urlParams = new URLSearchParams(window.location.search);
        const displayName = urlParams.get('displayName');
        const userPrincipalName = urlParams.get('userPrincipalName');

        if (displayName) {
            // Si hay un displayName, significa que venimos de la autenticación de Microsoft
            initializeUserSession(displayName, userPrincipalName);
        }
    });

    const initializeUserSession = async (displayName, userPrincipalName) => {
        try {
            // Verificar si el nickname ya existe
            const player = await api.verifyNickname(displayName);
            
            if (player) {
                // Si el nickname ya existe, podrías añadir un sufijo o manejar esto de otra manera
                alert("El nickname ya está en uso. Se añadirá un número.");
                displayName = displayName + Math.floor(Math.random() * 1000);
            }

            // Crear el jugador con el displayName
            await api.login(displayName);
            
            // Guardar información en sessionStorage
            sessionStorage.setItem('nickname', displayName);
            sessionStorage.setItem('userPrincipalName', userPrincipalName);

            // Redirigir al menú de sesión
            window.location.href = "./sessionMenu.html";
        } catch (error) {
            console.error("Error al inicializar la sesión:", error);
            alert("Hubo un error al iniciar sesión");
        }
    };

    const loginWithMicrosoft = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/aad";
    };

    const handleAuthCallback = async () => {
        // Este método puede que ya no sea necesario con el nuevo flujo
        try {
            const response = await api.getCurrentUser();
            
            if (response) {
                sessionStorage.setItem('userInfo', JSON.stringify(response));
                window.location.href = "./sessionMenu.html";
            } else {
                alert("No se pudo obtener la información del usuario");
            }
        } catch (error) {
            console.error("Error al manejar el callback de autenticación:", error);
            alert("Hubo un error en la autenticación");
        }
    };

    const login = async (displayName, token) => {
        sessionStorage.clear();
    
        try {
            const player = await api.verifyNickname(displayName);
            if (player) {
                console.log("El usuario ya existe en el sistema.");
            } else {
                await api.login(displayName);
            }
    
            sessionStorage.setItem('displayName', displayName);
            sessionStorage.setItem('token', token);
    
            window.location.href = "./sessionMenu.html";
        } catch (error) {
            console.error("Error al procesar el inicio de sesión:", error);
        }
    };

    return {
        loginWithMicrosoft,
        handleAuthCallback,
        login,
        getDisplayName: () => sessionStorage.getItem('displayName')
    };
})();
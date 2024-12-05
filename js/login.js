const login = (() => {
    let nickname = "";
    let api = apiClient;

    // Al cargar la página, limpiamos la sesión
    document.addEventListener("DOMContentLoaded", function () {
        sessionStorage.clear();
    });

    const loginWithMicrosoft = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/aad";
    };

    const handleAuthCallback = async () => {
        try {
            // Obtiene la información del usuario desde el backend después de la autenticación
            const response = await api.getCurrentUser();
            
            if (response) {
                // Guarda la información del usuario en sessionStorage
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

    const login = async (newNickname) => {
        sessionStorage.clear();
        nickname = newNickname;

        try {
            const player = await api.verifyNickname(nickname);
            if (player) {
                alert("El nickname ya está en uso. Por favor elige otro.");
            } else {
                await api.login(nickname);
                sessionStorage.setItem('nickname', nickname);
                window.location.href = "./sessionMenu.html";
            }
        } catch (error) {
            console.error("Error al verificar el nickname:", error);
        }
    };

    return {
        loginWithMicrosoft,
        handleAuthCallback,
        login,
        getNickname: () => nickname
    };
})();

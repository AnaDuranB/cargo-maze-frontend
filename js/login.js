const login = (() => {
    let api = apiClient;

    // document.addEventListener("DOMContentLoaded", async function () {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const displayName = urlParams.get("displayName");
    //     const userPrincipalName = urlParams.get("userPrincipalName");
    //     const token = urlParams.get("token");

    //     if (displayName && userPrincipalName && token) {
    //         initializeUserSession(displayName, userPrincipalName, token);
    //     } else {
    //         try {
    //             const userInfo = await api.getCorrectInfo();
    //             if (userInfo.displayName && userInfo.userPrincipalName && userInfo.token) {
    //                 initializeUserSession(userInfo.displayName, userInfo.userPrincipalName, userInfo.token);
    //             } else {
    //                 console.warn("Datos de autenticación no encontrados.");
    //             }
    //         } catch (error) {
    //             console.warn("Error al obtener información de autenticación: ", error);
    //         }
    //     }
    // });


    const loginWithMicrosoft = async () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/aad";
        let response = await getCorrectInfo();
        await initializeUserSession(response.displayName, response.userPrincipalName, response.token);
    };

    const initializeUserSession = async (displayName, userPrincipalName, token) => {
        try {
            await handleNickname(displayName);

            sessionStorage.setItem("userPrincipalName", userPrincipalName);
            sessionStorage.setItem("token", token);

            window.location.href = "./sessionMenu.html";
        } catch (error) {
            console.error("Error al inicializar la sesión:", error);
            alert("Hubo un error al iniciar sesión.");
        }
    };

    const handleNickname = async (newNickname) => {
        sessionStorage.clear();

        try {
            const player = await api.verifyNickname(newNickname);
            if (player) {
                alert("El nickname ya está en uso. Por favor elige otro.");
                throw new Error("Nickname en uso.");
            } else {
                await api.login(newNickname);
                sessionStorage.setItem("nickname", newNickname);
            }
        } catch (error) {
            console.error("Error al manejar el nickname:", error);
            throw error;
        }
    };

    const getDisplayName = () => sessionStorage.getItem("nickname");

    return {
        loginWithMicrosoft,
        getDisplayName,
    };
})();

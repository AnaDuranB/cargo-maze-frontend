const login = (() => {
    let api = apiClient;

    const loginWithMicrosoft = async () => {
        try {
            loginWithMicrosoftInNewTab();
        } catch (error) {
            console.error("Error during authentication: ", error);
        }
    };

    const loginWithMicrosoftInNewTab = async () => {
        const popup = window.open(
            "https://cargo-maze-backend-hwgpaheeb7hreqgv.eastus2-01.azurewebsites.net",
            "_blank",
            "width=600,height=600"
        );

        window.addEventListener("message", (event) => {
            if (event.origin !== "https://calm-rock-0d4eb650f.5.azurestaticapps.net") return; // Validar origen del mensaje
            if (event.data.status === "success") {
                console.log("Autenticación completada."); 
                sessionStorage.setItem("nickname", getCookie('display_name'));
                console.log(sessionStorage.getItem("nickname"));
                const authToken = getCookie("auth_token");    
                console.log('authToken:', authToken); 
                initializeUserSession();

            }
        });
    };

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }


    const initializeUserSession = async () => {
        try {

            await handleNickname(sessionStorage.getItem("nickname"));
            window.location.href = "./sessionMenu.html";

        } catch (error) {
            console.error("Error al inicializar la sesión:", error);
        }
    };

    const handleNickname = async (newNickname) => {
        try {
            const player = await api.verifyNickname(newNickname);
            if(!player){
                await api.login(newNickname);
            }
            console.log('player:', player);
        } catch (error) {
            console.error("Error al manejar el nickname:", error);
            throw error;
        }
    };

    return {
        loginWithMicrosoft,
        getDisplayName: () => sessionStorage.getItem("nickname"),
    };
})();

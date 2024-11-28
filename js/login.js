const login = (() => {
    let nickname = "";
    let api = apiClient;

    document.addEventListener('DOMContentLoaded', function() {
        sessionStorage.clear();
    });

    const login = async (newNickname) => {
        sessionStorage.clear();
        nickname = newNickname;
        try {
            await api.login(nickname);
            sessionStorage.setItem('nickname', nickname);
            window.location.href = "./sessionMenu.html";
        } catch (error) {
            alert(error.responseJSON.error);
        }
    };

    return {
        login, getNickname: () => nickname
    };

})();
let globalAuth;

function setGlobalAuth(auth) {
    globalAuth = auth;
}

function getGlobalAuth() {
    return globalAuth;
}

module.exports = {
    setGlobalAuth,
    getGlobalAuth,
};

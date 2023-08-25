const generateMassage = (username, text) => {
    return {
        username,
        text,
        CreatedAt: new Date().getTime()
    }
}
const generateLocationMassage = (username, url) => {
    return {
        username,
        url,
        CreatedAt: new Date().getTime()
    }
}
module.exports = {
    generateMassage,
    generateLocationMassage
}
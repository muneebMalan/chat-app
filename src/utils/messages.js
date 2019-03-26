const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()//Date().toString()
        //1549034701221
        //1549034703347
    }
}

const generateLocationMessage = (username, link) => {
    return {
        username,
        link,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}
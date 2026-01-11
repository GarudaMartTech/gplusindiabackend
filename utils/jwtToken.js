const config = require("../config/index.js")

const sendToken = (user,statusCode, res) => {  
    const token = user.getJWTToken();

    const options = {
        expires: new Date(  
            Date.now() + config.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    secure: false,     // http ke liye false
    sameSite: "lax",
    }

    res.cookie("token",token,options)

    res.status(statusCode).json({
        success: true,
        user,
        token
    })
}

module.exports = sendToken
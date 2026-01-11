const ErrorHandler = require("../utils/ErrorHandler.js")

module.exports = (err,req, res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "InternalServer Error";

    // wrong mongodb id error
    if(err.name === 'CastError'){
        const message = `Resource not found: ${err.path}`;
        err = new ErrorHandler(message, 400)
    }

    // duplicate email error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // wrong jwt error
    if(err.name === "JsonWebTokenError"){
        const message = `json web token is invalid ,try agin`;
        err = new ErrorHandler(message, 400)
    }

    // JWT exprire error
    if(err.name === "TokenExpiredError"){
        const message = `Json web token expired`;
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}
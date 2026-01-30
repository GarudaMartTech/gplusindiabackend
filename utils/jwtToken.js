const config = require("../config/index.js");

const sendToken = (user, statusCode, res) => {  
  const token = user.getJWTToken();

  const options = {
    httpOnly: true,
    secure: false,    
    sameSite: "lax",

    // FIXED
    maxAge: Number(config.COOKIE_EXPIRE || 5) * 24 * 60 * 60 * 1000
  };

  res.cookie("token", token, options);

  res.status(statusCode).json({
    success: true,
    user,
    token
  });
};

module.exports = sendToken;

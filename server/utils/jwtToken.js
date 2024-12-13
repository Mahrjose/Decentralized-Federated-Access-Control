const sendToken = (user, statusCode, res) => {

    const token = user.getJWTToken();
  
    res.status(statusCode).cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'PRODUCTION',
        sameSite: 'strict',
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    }).json({success: true, user, token});
    
  };
  
  module.exports = sendToken;
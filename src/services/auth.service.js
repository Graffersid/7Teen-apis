const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Login with phone
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithPhone = async (phone) => {
  const user = await userService.getUserByPhone(phone);
  if (!user ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect phone');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify OTP
 * @param {string} verifyOTPToken
 * @returns {Promise}
 */
const verifyOTP = async (verified,phone) => {
  if(verified){
      try {
            const user = await userService.getUserByPhone(phone);
            //console.log(user);
        if (!user) {
          throw new Error();
        }
        //await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
        await userService.updateUserById(user.id, { isEmailVerified: true });
        return user;
      } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Phone verification failed');
      }
  }
  else
  {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Phone verification failed-2');
  }
};


/**
 * Generate OTP
 * @param {string} otp
 * @param {string} otp
 * @returns {Promise}
 */
 const generateOTP = async (phone) => {
  var digits = '0123456789';

      var otpLength = 4;

      var otp = '';

      for(let i=1; i<=otpLength; i++)
      {

          var index = Math.floor(Math.random()*(digits.length));

          otp = otp + digits[index];

      }

    return(otp);
};

module.exports = {
  loginUserWithPhone,
  logout,
  refreshAuth,
  resetPassword,
  verifyOTP,
  generateOTP,
};

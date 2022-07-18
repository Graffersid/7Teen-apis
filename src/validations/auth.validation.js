const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  
  body: Joi.object().keys({
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
    email: Joi.string().email().required(),
  }),
};

const verifyotp={
  body: Joi.object().keys({
    otp: Joi.string().length(4).required(),
    hash: Joi.string().required(),
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  }),
};

const login = {
  body: Joi.object().keys({
    phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyotp,
};

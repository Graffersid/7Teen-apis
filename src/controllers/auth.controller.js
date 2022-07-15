const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const otpGen  = require("otp-generator");
const otpTool = require("otp-without-db");
const key     = "secretKey"; // Use unique key and keep it secret

const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
let phone = req.body.phone;  
//console.log(phone);
const otp = await authService.generateOTP(phone);

  console.log(otp);
  let hash = otpTool.createNewOTP(phone,otp,key);
  const user = await userService.createUser(req.body);
  //console.log(user);  
  const tokens = await tokenService.generateAuthTokens(user);
  await emailService.sendOTPEmail('monika.arora@graffersid.com', otp);
  console.log(hash);  
  res.status(httpStatus.CREATED).send({ user, tokens,hash });
});


const verifyotp = catchAsync(async (req, res) => {
  const key     = "secretKey"; // Use unique key and keep it secret
  let phone = req.body.phone; 
    let verified = otpTool.verifyOTP(req.body.phone,req.body.otp,req.body.hash,key);
    console.log(verified);
    
 let user= await authService.verifyOTP(verified,phone);
 res.status('200').send({ user });

    
  });



const login = catchAsync(async (req, res) => {
  const { phone } = req.body;
  const user = await authService.loginUserWithPhone(phone);
  if(user.role=='parent')
  {
    const user_childs = await userService.getChilds(user);
   // console.log(user_childs);
    res.send({ user_childs, tokens });
  }
  //console.log(user.id);
  const user_verified = await authService.validateUser(user);
  console.log(user_verified);
  if(user_verified){
    const otp = await authService.generateOTP(phone);
    console.log(otp);
    let hash = otpTool.createNewOTP(phone,otp,key);
    //await emailService.sendOTPEmail('monika.arora@graffersid.com', otp);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens,hash });
  }
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  verifyotp,
};

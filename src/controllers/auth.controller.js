const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const otpGen  = require("otp-generator");
const otpTool = require("otp-without-db");
const key     = "secretKey"; // Use unique key and keep it secret

const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
let phone = req.body.phone;  
let email = req.body.email;  

const otp = await authService.generateOTP(phone);

  let hash = otpTool.createNewOTP(phone,otp,key);
  const user = await userService.createUser(req.body);
   
  await emailService.sendOTPEmail(email, otp);
  
  res.status(httpStatus.CREATED).send({ user,hash });
});


const verifyotp = catchAsync(async (req, res) => {
  const key     = "secretKey"; // Use unique key and keep it secret
  let phone = req.body.phone; 
    let verified = otpTool.verifyOTP(req.body.phone,req.body.otp,req.body.hash,key);
    
 let user= await authService.verifyOTP(verified,phone);
 var data= {};
 data['id']=user._id;
 if(user.parent_name != '')
 {
    data['profileComplete']=true;
 }
 else
 {
    data['profileComplete']=false;
 }
 const tokens = await tokenService.generateAuthTokens(user);
 res.status('200').send({ data, tokens });

    
  });



const login = catchAsync(async (req, res) => {
  let phone = req.body.phone;  
  let email = req.body.email;  
  const user = await authService.loginUserWithPhone(phone);
  const otp = await authService.generateOTP(phone);
  let hash = otpTool.createNewOTP(phone,otp,key);
  await emailService.sendOTPEmail(email, otp);
 
  res.send({ user,hash });
  
});


const parentRegister = catchAsync(async (req, res) => {
  let phone = req.body.phone;  
  let email = req.body.email;  
  
  const otp = await authService.generateOTP(phone);
  
    let hash = otpTool.createNewOTP(phone,otp,key);
    const user = await userService.createParent(req.body);
     
    const tokens = await tokenService.generateAuthTokens(user);
    await emailService.sendOTPEmail(email, otp);
    
    res.status(httpStatus.CREATED).send({ user, tokens,hash });
  });


  const parentLogin = catchAsync(async (req, res) => {
    let phone = req.body.phone;  
    let email = req.body.email;  
    const user = await authService.loginUserWithPhone(phone);
    const otp = await authService.generateOTP(phone);
    let hash = otpTool.createNewOTP(phone,otp,key);
    await emailService.sendOTPEmail(email, otp);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens,hash });
    
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

const resendOtp = catchAsync(async (req, res) => {
    let phone = req.body.phone;  
    let email = req.body.email;  
    const user = await userService.getUserByPhone(phone);
    const otp = await authService.generateOTP(phone);
    let hash = otpTool.createNewOTP(phone,otp,key);
    await emailService.sendOTPEmail(email, otp);
    res.send({ user,hash });
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
  parentLogin,
  parentRegister,
  resendOtp
};

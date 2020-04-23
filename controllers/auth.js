const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require("crypto");


// @desc     Add a User
// @route    POST api/v1/auth/register
// @access   Public
exports.register = asyncHandler(async (req, res, next) => {
  // const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create(req.body);

  sendTokenResponse(user, 200, res);
});


// @desc     Login
// @route    POST api/v1/auth/login
// @access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  const isMatch = await user.matchPassword(password);



  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  };

  sendTokenResponse(user, 200, res);


});


// @desc    Log Out / ckear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logOut = asyncHandler(async(req,res,next)=>{
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true
  });


  console.log(req.headers.authorization);


  res.status(200).json({
    success: true,
    data: {}
  })
})

// @desc    GET Current logged in User
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: user,

  });
});

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('User Not Found', 404));
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false })

  // create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You have received this email because you requested the reset of a password, Please make a PUT request to: \n\n${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      message
    });

    res.status(200).json({
      success: true,
      msg: 'Email sent'
    })



  } catch (error) {
    console.error(error);
    user.getResetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email can not be sent', 500));

  };

})

// @desc    Reset Password
// @route   POST /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');


  const user = await  User.findOne({ 
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now()}})
    .select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400))
  }

  const isMatched = await user.matchPassword(req.body.password);

  if (isMatched) {
    return next(new ErrorResponse('New password cannot be the same as the old one', 400));
  } 

  // // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    await user.save();

    sendTokenResponse(user, 200, res)


});


// @desc    Update Details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async(req,res,next)=>{
  const updatedDetails = {
    name: req.body.name,
    email: req.body.email
  };


  const user = await User.findByIdAndUpdate(req.user.id, updatedDetails, {
    runValidators: true,
    new: true
  });

  res.status(200).json({
    success: true,
    data: user
  })

});

// @desc    Update Password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async(req,res,next)=>{
  const user = await User.findById(req.user.id).select('+password');


  // Check current password
  if(!(await user.matchPassword(req.body.currentPassword))){
    return next(new ErrorResponse('Worng Password', 401))
  }

  if((await user.matchPassword(req.body.newPassword))){
    return next(new ErrorResponse('Password cannot be the same as the old one', 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);

});



// Get token from model, create cookie and response
const sendTokenResponse = (user, statusCode, res) => {

  // Create Token 
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    option.secure = true
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token })

}




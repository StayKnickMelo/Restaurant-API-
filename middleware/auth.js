const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Set token from Bear Token from in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    
  } 

  //set the token from the Cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token


  // }
    
    




  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Unautorized to access this route', 401))
  }

  // Verify Token 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();

  } catch (error) {
    return next(new ErrorResponse('Unautorized to access this route', 401));

  }
});


exports.authorize = (...roles) => {
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return next(new ErrorResponse(`User role ${req.user.role} is unauthorized to access this route`,401))
    }

    next();
  }
}
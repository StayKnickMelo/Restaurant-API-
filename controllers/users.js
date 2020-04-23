const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');


// @desc     GET All Users
// @route    GET api/v1/auth/users
// @access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {

  // if(req.user.role !== 'admin'){
  //   return next(new ErrorResponse('Unauthorized to access this route', 401));
  // }

  const users = await User.find();

  res.status(200).json({
    success: true,
    data: users,
    count: users.length
  });

});

// @desc     GET a single User
// @route    GET api/v1/auth/users/:id
// @access   Private/Admin
exports.getUser = asyncHandler(async(req,res,next)=>{
  
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Unauthorized to access this route', 401));
  }

  const user = await User.findById(req.params.id);


  if(!user){
    return next(new ErrorResponse(`User with id of ${req.params.id} Not Found`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc     Create a User
// @route    POST api/v1/auth/users
// @access   Private/Admin
exports.addUser = asyncHandler(async(req,res,next)=>{
  let user = await User.findOne({email: req.body.email});

  if(user){
    return next(new ErrorResponse(`User with email of ${req.body.email} alredy exists`, 400))
  }

  user = await User.create(req.body);


  res.status(201).json({
    success: true,
    data: user
  })
})


// @desc     Update a User
// @route    PUT api/v1/auth/users/:id
// @access   Private/Admin
exports.updateUser = asyncHandler(async(req,res,next)=>{

  // if(req.user.role !== 'admin'){
  //   return next(new ErrorResponse('Unauthorized to access this route', 401));
  // };

  let user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorResponse(`User with id of ${req.params.id} Not Found`, 404));
  }
  
  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new:true
  });

  res.status(200).json({
    success: true,
    data: user
  })
});


// @desc     Delete a User
// @route    DELETE api/v1/auth/users/:id
// @access   Private/Admin
exports.deleteUser = asyncHandler(async(req,res,next)=>{
  // if(req.user.role !== 'admin'){
  //   return next(new ErrorResponse('Unauthorized to access this route', 401));
  // }

  const user = await User.findById(req.params.id);

  if(!user){
    return next(new ErrorResponse(`User with id of ${req.params.id} Not Found`, 404))
  };

  await user.remove();

  res.status(200).json({
    success: true,
    deleted: true
  })
})













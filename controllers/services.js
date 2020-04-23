const Service = require('../models/Service');
const Restaurant = require('../models/Restaurant');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');


// @desc    Get all services
// @route   GET /api/v1/services
// @route   GET /api/v1/restaurants/:restaurantId/services
// @access  Public
exports.getServices = asyncHandler(async (req, res, next) => {

  if (req.params.restaurantId) {
    const services = await Service.find({ restaurant: req.params.restaurantId }).populate({
      path: 'restaurant',
      select: 'name description'
    });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });

  } else {
    res.status(200).json(res.advancedResults);
  }

});

// @desc    Get a single service
// @route   GET /api/v1/services/:id
// @access  Public
exports.getAService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate({
    path: 'restaurant',
    select: 'name description'
  });

  if (!service) {
    return next(new ErrorResponse(`Service with id of ${req.params.id} Not Found`, 404));
  }


  res.status(200).json({
    success: true,
    data: service
  });
})


// @desc    Add a service
// @route   POST /api/v1/restaurants/:restaurantId/services
// @access  Private
exports.addService = asyncHandler(async (req, res, next) => {

  req.body.restaurant = req.params.restaurantId;
  req.body.user = req.user.id;

  let restaurant = await Restaurant.findById(req.params.restaurantId);

  if (!restaurant) {
    return next(new ErrorResponse(`Restaurant with id of ${req.params.restaurantId} Not Found`, 404))
  };

  if(restaurant.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse('Unauthorized to add service to current restaurant', 401));
  }

  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service
  });

});


// @desc    Update a service
// @route   PUT /api/v1/services/:id
// @access  Private
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse(`Service with id of ${req.params.id} Not Found`, 404));
  };

  if(service.user.toString()!== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse('Unauthorized to update current service', 401));
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: service
  });
});


// @desc    Delete a service
// @route   DELETE /api/v1/services/:id
// @access  Private
exports.deleteService = asyncHandler(async(req,res,next)=>{
  const service = await Service.findById(req.params.id);


  if(!service){
    return next(new ErrorResponse(`Service with id of ${req.params.id} Not Found`, 404));
  }


  if(service.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse('Unauthorized to delete current service', 401));
  }

  await service.remove();

  res.status(200).json({
    success: true,
    deleted: true
  })
})






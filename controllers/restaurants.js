const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geoCoder');
const path = require('path');




// @desc    Get all Restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = asyncHandler(async (req, res, next) => {

  
  res.status(200).json(res.advancedResults);


});

// @desc    Get a single Restaurant
// @route   GET /api/v1/restaurants/:id
// @access  Public
exports.getARestaurant = asyncHandler(async (req, res, next) => {

  const restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse(`Restaurant with id of ${req.params.id} Not Found`, 404));
  }

  res.status(200).json({
    success: true,
    data: restaurant
  })

});

// @desc    Get all Restaurants within radius
// @route   GET /api/v1/restaurants/radius/:lat/:long
// @access  Public
exports.getRestaurantByRadius = asyncHandler(async (req, res, next) => {

  const { zipcode, distance } = req.params;

  // Get Lat & Long from geocoder
  const loc = await geocoder.geocode(zipcode);

  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide distance by radius of the Earth
  // Earth radius = 6,378 km

  // console.log(lng, lat)

  const radius = distance / 6378;

  const restaurants = await Restaurant.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  if (restaurants.length === 0) {
    return next(new ErrorResponse(`Restaurants Not Found Within ${distance} km`))
  }

  // console.log(radius);

  res.status(200).json({
    success: true,
    data: restaurants,
    count: restaurants.length
  });

});




// @desc    Add a Restaurant
// @route   POST /api/v1/restaurants
// @access  Private
exports.addRestaurant = asyncHandler(async (req, res, next) => {

  req.body.user = req.user.id
  

  let restaurant = await Restaurant.findOne({ user: req.user.id });


  if(restaurant && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User with id of ${req.user.id} has already posted a restaurant`, 400));
  }

  restaurant = await Restaurant.create(req.body);

  res.status(201).json({
    success: true,
    data: restaurant
  });

})

// @desc    Update a  Restaurant
// @route   PUT /api/v1/restaurants/:id
// @access  Private
exports.updateRestaurant = asyncHandler(async (req, res, next) => {


  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse(`Restaurant with id of ${req.params.id} Not Found`, 404));
  }

  if (restaurant.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`Unauthorized to update restaurant info`, 401));
  }

  restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: restaurant
  })



})

// @desc    Delete a  Restaurant
// @route   DELETE /api/v1/restaurants/:id
// @access  Private
exports.deleteRestaurant = asyncHandler(async (req, res, next) => {

  let restaurant = await Restaurant.findById(req.params.id);

  if (!restaurant) {
    return next(new ErrorResponse(`Restaurant with id of ${req.params.id} Not Found`, 404));
  };

  if(restaurant.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse('Unauthorized to delete current restaurant', 401));
  }

  await restaurant.remove();

  res.status(200).json({
    success: true,
    deleted: true
  })

});


// @desc    Upload a photo to a Restaurant
// @route   PUT /api/v1/restaurants/:id/photo
// @access  Private
exports.photoUpload = asyncHandler(async(req,res,next)=>{
  const restaurant = await Restaurant.findById(req.params.id);


  if(!restaurant){
    return next(new ErrorResponse(`Restaurant with id of ${req.params.id} Not Found`, 404));
  };


  if(restaurant.user.toString() !== req.user.id && req.user.role !=='admin'){
    return next(new ErrorResponse('Unauthorized to upload an image to current restaurant', 401));
  }


  if(!req.files){
    return next(new ErrorResponse(`No File to Upload`, 400));
  }

  const file = req.files.file;

  if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse(`Please upload an image file`, 400))
  };

  if(file.size > process.env.MAX_FILE_UPLOAD){
    return next(new ErrorResponse(`Image file can not be bigger than ${process.env.MAX_FILE_UPLOAD}`, 400));
  };

  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err)=> {
    if(err){
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    await Restaurant.findByIdAndUpdate(req.params.id, {
      photo: file.name
    });


    res.status(200).json({
      success: true,
      data: file.name
    });
  })

})


const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');



// @desc    Get all Reviews for Specific Restaurant
// @route   GET /api/v1/restaurants/:restaurantId/reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {


  if (req.params.restaurantId) {
    const reviews = await Review.find({ restaurant: req.params.restaurantId }).populate({
      path: 'restaurant user',
      select: 'name description'
    });

    return res.status(200).json({
      success: true,
      data: reviews
    });

  } else {
    const reviews = await Review.find().populate({
      path: 'restaurant',
      select: 'name description'
    });

    res.status(200).json({
      success: true,
      data: reviews,
      count: reviews.length
    })
  }

});

// @desc    Get a single Review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'restaurant user',
    select: 'name description'
  });

  if (!review) {
    return next(new ErrorResponse(`Review with id of ${req.params.id} Not Found`, 404));
  }

  res.status(200).json({
    success: true,
    data: review
  });
});


// @desc    Add a Review
// @route   POST /api/v1/restaurants/restaurantId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.restaurant = req.params.restaurantId;
  req.body.user = req.user.id;

  const restaurant = await Restaurant.findById(req.params.restaurantId);

  if (!restaurant) {
    return next(new ErrorResponse(`Restaurant with id of ${req.params.restaurantId} Not Found`, 404));
  }

  let review = await Review.findOne({ restaurant: req.params.restaurantId, user: req.user.id });

  // console.log(review);
  // console.log(review.user.toString())
  // console.log(req.user.id)

  if(review){
    return next(new ErrorResponse(`User ${req.user.id} has already submitted a review for current restaurant`, 400))
  }

  // if (review) {
  //   if (review.user.toString() === req.user.id && review.restaurant._id.toString() === req.params.restaurantId) {
  //     return next(new ErrorResponse(`User ${req.user.id} has already submitted a review for current restaurant`, 400))

  //   }

  // }


  review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  })

});


// @desc    Update a Review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {

  let review = await Review.findById(req.params.id);

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Unauthorized to access this route', 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  });


  res.status(200).json({
    success: true,
    data: review
  })

});


// @desc    Delete a Review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Review with id of ${req.params.id} Not Found`, 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Unauthorized to access this route', 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    deleted: true
  })
});






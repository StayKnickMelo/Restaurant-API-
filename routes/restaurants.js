const express = require('express');

const router = express.Router();

const {
  getRestaurants,
  addRestaurant,
  getARestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantByRadius,
  photoUpload

} = require('../controllers/restaurants');

const { protect, authorize } = require('../middleware/auth');

const advancedResults = require('../middleware/advancedResults');
const Restaurant = require('../models/Restaurant');

// Include other resource routes
const serviceRouter = require('./services');
const reviewRouter = require('./reviews');

// Re-route into other resources
router.use('/:restaurantId/services', serviceRouter);
router.use('/:restaurantId/reviews', reviewRouter);

router.route('/')
  .get(advancedResults(Restaurant, 'service'), getRestaurants)
  .post(protect,authorize('owner', 'admin'), addRestaurant);

router.route('/:id')
  .get(getARestaurant)
  .put(protect, authorize('owner', 'admin'), updateRestaurant)
  .delete(protect, authorize('owner', 'admin'), deleteRestaurant);

router.route('/:id/photo')
  .put(protect, authorize('owner', 'admin'), photoUpload);

router.route('/radius/:zipcode/:distance')
  .get(getRestaurantByRadius)



module.exports = router;
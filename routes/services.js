const express = require('express');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const Service = require('../models/Service');

const {
  getServices,
  addService,
  getAService,
  updateService,
  deleteService

} = require('../controllers/services');

const { protect, authorize } = require('../middleware/auth');


router.route('/')
  .get(advancedResults(Service, {
    path: 'restaurant',
    select: 'name description'
  }), getServices)
  .post(protect, authorize('owner', 'admin'), addService);

router.route('/:id')
  .get(getAService)
  .put(protect, authorize('owner', 'admin'), updateService)
  .delete(protect, authorize('owner', 'admin'), deleteService);


module.exports = router;
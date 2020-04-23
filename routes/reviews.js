const express = require('express');

const router = express.Router({ mergeParams: true });

const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');

const {protect, authorize} = require('../middleware/auth');

router.route('/')
  .get(getReviews)
  .post(protect, authorize('admin', 'user'),addReview );

router.route('/:id')
  .get(getReview)
  .put(protect, authorize('admin', 'user'), updateReview)
  .delete(protect, authorize('user','admin'), deleteReview);




module.exports = router;
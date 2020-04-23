const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logOut
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

router.route('/register')
  .post(register);

router.route('/login')
  .post(login);

router.route('/logout')
  .get(protect,logOut);

router.route('/me')
  .get(protect, getMe);

router.route('/forgotpassword')
  .post(forgotPassword);

router.route('/resetpassword/:resettoken')
  .post(resetPassword);

router.route('/updatedetails')
  .put(protect, updateDetails);

router.route('/updatepassword')
  .put(protect, updatePassword);


module.exports = router;
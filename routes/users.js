const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addUser

} = require('../controllers/users');

const {protect,authorize} = require('../middleware/auth');


router.route('/')
  .get(protect,authorize('admin'),getUsers)
  .post(protect, authorize('admin'), addUser);

router.route('/:id')
  .get(protect,authorize('admin'),getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);


module.exports = router;
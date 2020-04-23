const mongoose = require('mongoose');

const ServiceSchema = mongoose.Schema({
  description:{
    type: String,
    required: [true, 'Please add a description']
  },
  serviceType: {
    type: String,
    required: [true, 'Please add a service type']
  },
  eventsBooking: {
    type: Boolean,
    default: false
  },
  veganMenu: {
    type: Boolean,
    default: false
  },
  bookingRequired: {
    type: Boolean,
    default: false
  },
  kindsFriendly: {
    type: Boolean,
    default: false
  },
  seatCapacity: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});


module.exports = mongoose.model('Service', ServiceSchema);
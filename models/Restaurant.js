const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geoCoder');

const RestaurantSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxLength: [20, 'Name cannot be greater than 20 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxLength: [500, 'Description cannot be greater than 500 characters']
  },
  website: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please use a valid URL with HTTP or HTTPS']
  },
  photo:{
    type: String,
    default: 'no-photo'
  },
  phone: {
    type: String,
    maxLength: [20, 'Phone number cannot be longer than 20 digits']
  },
  email: {
    type: String,
    match: [/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i, 'Please add a valid email']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    zipcode: String,
    country: String,
    city: String
  },
  cuisines: {
    type: [String],
    required: true,
    enum: ['Italian', 'Chinese', 'Japanese', 'German', 'Russian', 'Indian', 'Korean', 'French', 'Spanish', 'American']
  },
  delivery: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must be at most 10']
  },
  averageBill: Number,
  photo: {
    type: String,
    default: 'no-photo'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// Create a slug from the name
RestaurantSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Cascade delete service when Restaurant is deleted
RestaurantSchema.pre('remove', async function(next){
  console.log(`Service beign removed from Restaurant ${this._id}`.red.inverse);
  
  await this.model('Service').deleteOne({restaurant: this._id});
  next();
})

// Geocode & create location fields
RestaurantSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);

  // console.log(loc);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
    city: loc[0].city
  }

  

  // Do not save address in DB
  this.address = undefined

  next();
});

// Reverse populate with virtuals
// Virtuals does not persist to DB 
RestaurantSchema.virtual('service',{
  ref: 'Service',
  localField: '_id',
  foreignField: 'restaurant',
  justOne: true 

});


module.exports = mongoose.model('Restaurant', RestaurantSchema);
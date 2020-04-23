const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title'],
    maxLength: 100
  },
  text:{
    type: String,
    required: [true, 'Please add a review']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
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

// Prevent user from submiting more than one review per restaurant
// ReviewSchema.index({ restaurant: 1, user: 1 }, { unique: true });

// Get average Rating of a restaurant
ReviewSchema.statics.getAverageRating = async function(restaurantId){
  const obj = await this.aggregate([
    {
      $match: {restaurant: restaurantId}
    },
    {
      $group: {
        _id:'$restaurant',
        averageRating: {$avg: '$rating'}
      }
    }
  ]);

  try {
    await this.model('Restaurant').findByIdAndUpdate(restaurantId, {
      averageRating: obj[0].averageRating
    })
    
  } catch (error) {
    console.error(error);
    
  }

}

// After Save
ReviewSchema.post('save', function(){
  this.constructor.getAverageRating(this.restaurant);
});

ReviewSchema.post('update', function () {
  this.constructor.getAverageRating(this.restaurant);
})

// Before Remove
ReviewSchema.pre('remove', function(){
  this.constructor.getAverageRating(this.restaurant)
});




module.exports = mongoose.model('Review', ReviewSchema);
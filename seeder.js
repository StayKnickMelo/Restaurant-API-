const mongoose = require('mongoose');
const dontEnv = require('dotenv');
const fs = require('fs');
const colors = require('colors');


// Load env vars
dontEnv.config({ path: './config/config.env' });

// Load models
const Restaurant = require('./models/Restaurant');
const Service = require('./models/Service');
const User = require('./models/User');
const Review = require('./models/Review');


mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});


// Read JSON files
const restaurants = JSON.parse(fs.readFileSync(`${__dirname}/_data/restaurants.json`, 'utf-8'));
const services = JSON.parse(fs.readFileSync(`${__dirname}/_data/services.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));


const importData = async () => {
  try {
    await Restaurant.create(restaurants);
    await Service.create(services);
    await User.create(users);
    await Review.create(reviews);
    console.log('Data Imported'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

const deleteData = async () => {
  try {
    await Restaurant.deleteMany();
    await Service.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Deleted'.red.inverse);
    process.exit();

  } catch (error) {
    console.error(error);

  }
}


if (process.argv[2] === '-i') {
  importData()
  
} else if (process.argv[2] === '-d'){
  
  deleteData()
};


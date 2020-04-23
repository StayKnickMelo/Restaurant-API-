const express = require('express');
const dotEnv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');
const fileUpload = require('express-fileupload');
const path = require('path');
const advancedResults = require('./middleware/advancedResults');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
// Middleware
const errorHandler = require('./middleware/error');
const morgan = require('morgan');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');



//  Load env files
dotEnv.config({ path: './config/config.env' });

// Connect DB 
connectDB();


// Routes
const restaurants = require('./routes/restaurants');
const services = require('./routes/services');
const users = require('./routes/users');
const auth = require('./routes/auth');
const reviews = require('./routes/reviews');




const app = express();

// Body parser
app.use(express.json());

// Rate Limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});


// MiddleWare Enable
app.use(fileUpload());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(limiter);
app.use(hpp());
app.use(cors());



// Dev logging middleware 
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


// Mount Routes
app.use('/api/v1/restaurants', restaurants);
app.use('/api/v1/services', services);
app.use('/api/v1/auth/users', users);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reviews', reviews);

// Must be after mounted routes
app.use(errorHandler);




const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`.white.inverse.bold);
});





// Handle unhandled promise rejections
process.on('unhandledRejection', (err,promise)=>{
  console.log(`Error: ${err.message}`.red.inverse);
  // Close server and exit process
  server.close(()=> process.exit(1));
});
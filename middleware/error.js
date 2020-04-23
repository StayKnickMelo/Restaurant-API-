const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err,req,res,next)=>{
  let error = {...err};

  console.log(err.message);

  error.message = err.message;

  // Log to console for dev
  console.log(err.stack.red);

  // Mongoose bad ObjectId
  if(err.name === 'CastError'){
    const message = `Resourse with id of ${err.value} Not Found`;
    error = new ErrorResponse(message, 404);

  }

  // Mongoose Duplicate key
  if(err.code === 11000){
    const message = `Duplicate Fileds Value`;
    error = new ErrorResponse(message, 400)
  }

  // Mongoose Validation err
  if(err.name === 'ValidationError'){
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
 
  

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })

  
  
}

module.exports = errorHandler;
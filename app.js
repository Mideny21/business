const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const businessRouter = require('./routes/businessRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1)  GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Development looging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'}));

// Data sanitization against NoSQl query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test  middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/business', businessRouter);
app.use('/api/v1/users', userRouter);


app.all('*', (req,res, next )=>{
  // // res.status(404).json({
  // //   status: 'fail',
  // //   message: `Can't find ${req.originalUrl} on this server!`
  // // }) 

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this serever!`, 404));
});


app.use(globalErrorHandler);

module.exports = app;

const express = require('express');
const morgan = require('morgan');
const protected = require('./controllers/authController').protect;
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const constellationRouter = require('./routes/constellationRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/constellations', constellationRouter);
app.use('/user', userRouter);

module.exports = app;


// adding cors for browser to call our api
const cors = require('cors')
// allow your local Flutter dev server + future prod domain
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: false // we’re NOT using cookies for Option A
}));
const express = require('express');
const morgan = require('morgan');
const protected = require('./controllers/authController').protect;
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const email = require('./utils/email')

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

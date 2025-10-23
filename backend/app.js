const express = require('express');
const morgan = require('morgan');

const constellationRouter = require('./routes/constellationRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use('/constellations', constellationRouter);
app.use('/user', userRouter);

module.exports = app;

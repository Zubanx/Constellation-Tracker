const express = require('express');
const morgan = require('morgan');
const authProtect = require('./controllers/authController').authProtect;
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const email = require('./utils/email');

const constellationRouter = require('./routes/constellationRoutes');
const userRouter = require('./routes/userRoutes');
const observationRouter = require('./routes/observationRoutes');
const progressRouter = require('./routes/progressRoutes');

const app = express();

// adding cors for browser to call our api
const cors = require('cors');
// allow local Flutter dev server + future prod domain
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
} else {
  app.use(
    cors({
      origin: ['https://cop-433121.com'],
      credentials: false,
    })
  );
}

app.use(helmet());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/constellations', constellationRouter);
app.use('/api/user', userRouter);
app.use('/api/observations', observationRouter);
app.use('/api/progress', progressRouter);

module.exports = app;

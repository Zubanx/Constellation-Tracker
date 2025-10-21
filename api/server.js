require('dotenv').config()

const express = require('express');
const app = express();
const mongoose = require('mongoose');

const dbUrl = process.env.dbURL;

mongoose.connect(dbUrl);
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

const constellationRouter = require('./routes/constellations')
app.use('/constellations', constellationRouter)


app.listen(3000, () => console.log('Server has Started'));
require('dotenv').config();
const app = require('./app');

const express = require('express');

const mongoose = require('mongoose');

const DB_URL = process.env.DB_URL;

async function connectDB() {
  try {
    if (!DB_URL) {
      console.error('DB_URL environment variable is not defined');
      process.exit(1);
    }
    await mongoose.connect(DB_URL, { dbName: 'mernAuthDB' });
    console.log('Connected to Database');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

connectDB();

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});

app.listen(3000, () => console.log('Server has Started'));

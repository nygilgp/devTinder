require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const routes = require('./routes');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());
routes(app);

connectDB()
  .then(() => {
    console.log('Database connected successfully');
    // start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

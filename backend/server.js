const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WebRouter = require("./routes/webRouter.js");
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON bodies in requests

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use("/", WebRouter);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const express = require("express");
const path = require('path');
const imageProcessor = require("./picture-processor");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static(path.resolve(__dirname, '../client/build')));


// API

app.get('/api', (req, res) => {
  
});


// Client

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});


// Listen to port

app.listen(PORT, () => {
  imageProcessor.test();
});

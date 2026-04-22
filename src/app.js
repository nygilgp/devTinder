const express = require('express');

const app = express();

const PORT = 3000;

// request handler for the root path
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

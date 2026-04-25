const auth = require('./auth');
const user = require('./user');
const request = require('./request');

const routes = (app) => {
  app.use('/api/', auth);
  app.use('/api/', user);
  app.use('/api/', request);
};

module.exports = routes;

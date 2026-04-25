const auth = require('./auth');
const user = require('./user');

const routes = (app) => {
  app.use('/api/', auth);
  app.use('/api/', user);
};

module.exports = routes;

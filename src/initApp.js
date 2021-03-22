async function initApp() {
  console.time('Total startup time');
  const bodyParser = require('body-parser');
  const ejs = require('ejs');
  const express = require('express');
  const handleRoutes = require('./handleRoutes');
  const { loadAllData } = require('./getData')
  const http = require('http');
  const HOST = '0.0.0.0';
  const HTTP_PORT = 5555;

  const app = express();
  app.set('x-powered-by', false); // Disable the `x-powered-by: Express` header
  app.use(express.static('src/static')); // serve static assets from applications `static` folder
  app.set('views', 'src/views'); // Set the views folder
  app.set('view engine', 'ejs'); // Set the express render engine
  app.use(bodyParser.json({ limit: '1mb', strict: false })); // Allow JSON post body
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' })); // Allow URL Encoded post body

  handleRoutes(app); // Set up all routes

  console.log('Loading initial data');
  await loadAllData();

  // Start the server (HTTP only!)
  http.createServer(app).listen(HTTP_PORT, HOST, () => {
    console.info(`HTTP server running on port "${HTTP_PORT}"`)
    console.timeEnd('Total startup time');
  });
}

module.exports = initApp;

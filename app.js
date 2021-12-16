const bodyParser = require('body-parser');
const cluster = require('cluster');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const express = require('express');
const favicon = require('serve-favicon');
const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');

const CronJob = require('./cron/Job');
const MongoStore = require('connect-mongo');

const numCPUs = process.env.WEB_CONCURRENCY || require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++)
    cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  if (cluster.worker.id == -1) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usersmagic';
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    CronJob.start(() => {
      console.log(`Cron jobs are started for every minute on worker ${cluster.worker.id}`);
    });
  } else {
    const app = express();
    const server = http.createServer(app);
  
    dotenv.config({ path: path.join(__dirname, '.env') });
  
    const PORT = process.env.PORT || 3000;
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usersmagic';
  
    const adminRouteController = require('./routes/adminRoute');
    const adsRouteController = require('./routes/adsRoute');
    const authRouteController = require('./routes/authRoute');
    const domainRouteController = require('./routes/domainRoute');
    const embedRouteController = require('./routes/embedRoute');
    const graphsRouteController = require('./routes/graphsRoute');
    const imageRouteController = require('./routes/imageRoute');
    const indexRouteController = require('./routes/indexRoute');
    const integrationRouteController = require('./routes/integrationRoute');
    const questionsRouteController = require('./routes/questionsRoute');
    const targetGroupsRouteController = require('./routes/targetGroupsRoute');
  
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');
  
    mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  
    const sessionOptions = session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
          mongoUrl: MONGODB_URI
      })
    });
  
    app.use(sessionOptions);
    app.use(cookieParser());
  
    app.use((req, res, next) => {
      res.append('Access-Control-Allow-Origin', ['*']);
      res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.append('Access-Control-Allow-Headers', 'Content-Type');
      
      if (!req.query || typeof req.query != 'object')
        req.query = {};
      if (!req.body || typeof req.body != 'object')
        req.body = {};
      next();
    });
  
    app.use('/', indexRouteController);
    app.use('/admin', adminRouteController);
    app.use('/ads', adsRouteController);
    app.use('/auth', authRouteController);
    app.use('/domain', domainRouteController);
    app.use('/embed', embedRouteController);
    app.use('/graphs', graphsRouteController);
    app.use('/image', imageRouteController);
    app.use('/integration', integrationRouteController);
    app.use('/questions', questionsRouteController);
    app.use('/target_groups', targetGroupsRouteController);
  
    server.listen(PORT, () => {
      console.log(`Server is on port ${PORT} as Worker ${cluster.worker.id} running @ process ${cluster.worker.process.pid}`);
    });
  }
}

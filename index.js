const startupDebugger = require('debug')('app:startup');
const dbDebugger = require('debug')('app:db');

const mongoose = require('mongoose');
const config = require('config');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const home = require('./routes/home');
const courses = require('./routes/courses');
const genres = require('./routes/genres');
const logger = require('./middleware/logger');

const app = express();

startupDebugger(`NODE_ENV: ${process.env.NODE_ENV}`);
startupDebugger(`app: ${app.get('env')}`);
startupDebugger('Application name: ' + config.get('name'));
startupDebugger('Mail server: ' + config.get('mail.host'));
startupDebugger('Mail server password: ' + config.get('mail.password'));

mongoose.connect('mongodb://localhost/playground', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(() => console.log('Could not connect to MongoDB...'));

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  startupDebugger('Morgan enabled...');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(logger);

app.set('view engine', 'pug');
app.set('views', './views');

app.use('/api/courses', courses);
app.use('/api/genres', genres);
app.use('/', home)


dbDebugger('Connected to the database...')

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening ${port}`));

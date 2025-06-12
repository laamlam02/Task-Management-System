const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/tms_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Configure sessions
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/tms_db' }),
}));

// General middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Temporary homepage route
app.get('/', (req, res) => {
  res.render('home', { title: 'Home', session: req.session });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
const authRoutes = require('./routes/auth');
app.use(authRoutes);

const taskRoutes = require('./routes/task');
app.use(taskRoutes);


function checkAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/dashboard', checkAuth, (req, res) => {
  res.render('dashboard');
});

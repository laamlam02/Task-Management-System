const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

// ========== GET: Register Page ==========
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
    session: req.session,
    error: null
  });
});

// ========== POST: Register User ==========
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.render('register', {
        title: 'Register',
        session: req.session,
        error: 'Username is already taken'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    res.render('register', {
      title: 'Register',
      session: req.session,
      error: 'An error occurred while registering. Please try again.'
    });
  }
});

// ========== GET: Login Page ==========
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    session: req.session,
    error: null
  });
});

// ========== POST: Login User ==========
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.render('login', {
        title: 'Login',
        session: req.session,
        error: 'Invalid username'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', {
        title: 'Login',
        session: req.session,
        error: 'Incorrect password'
      });
    }

    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Error logging in');
  }
});

// ========== GET: Dashboard ==========
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId);

    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, completed: true });
    const pendingTasks = await Task.countDocuments({ user: userId, completed: false });

    res.render('dashboard', {
      title: 'Dashboard',
      session: req.session,
      username: user.username, // لعرض اسم المستخدم في الصفحة
      totalTasks,
      completedTasks,
      pendingTasks
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.redirect('/login');
  }
});

// ========== GET: Logout ==========
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;

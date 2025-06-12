const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Middleware to ensure the user is logged in
function checkAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// GET - Show all tasks for logged-in user
router.get('/tasks', checkAuth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.session.userId });
res.render('tasks', {
      title: 'Your Tasks',
      session: req.session,
      tasks
    });  } catch (err) {
    res.status(500).send('Error fetching tasks');
  }
});

// GET - Show form to create a new task
router.get('/tasks/new', checkAuth, (req, res) => {

  res.render('new-task', {
    title: 'New Task',
    session: req.session
  });


});

// POST - Create a new task
router.post('/tasks', checkAuth, async (req, res) => {
  const { title, description, dueDate } = req.body;
  try {
    const task = new Task({
      title,
      description,
      dueDate,
      user: req.session.userId
    });
    await task.save();
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error creating task');
  }
});

// GET - Show form to edit a task
router.get('/tasks/edit/:id', checkAuth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.session.userId });
    if (!task) return res.status(404).send('Task not found');
res.render('edit-task', {
  title: 'Edit Task',
  session: req.session,
  task
});
  } catch (err) {
    res.status(500).send('Error loading task');
  }
});

// POST - Update a task
router.post('/tasks/edit/:id', checkAuth, async (req, res) => {
  const { title, description, dueDate, completed } = req.body;
  try {
    await Task.updateOne(
      { _id: req.params.id, user: req.session.userId },
      { title, description, dueDate, completed: completed === 'on' }
    );
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error updating task');
  }
});

// POST - Delete a task
router.post('/tasks/delete/:id', checkAuth, async (req, res) => {
  try {
    await Task.deleteOne({ _id: req.params.id, user: req.session.userId });
    res.redirect('/tasks');
  } catch (err) {
    res.status(500).send('Error deleting task');
  }
});

module.exports = router;

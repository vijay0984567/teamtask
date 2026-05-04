const express = require('express');
const { protect } = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;

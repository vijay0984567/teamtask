const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getProjects, createProject, updateProject,
  deleteProject, addMember, removeMember, getProjectById
} = require('../controllers/projectController');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;

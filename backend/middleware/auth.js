const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const requireProjectAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.id || req.body.projectId || req.query.projectId;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Project admin access required' });
    }
    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { protect, requireAdmin, requireProjectAdmin };

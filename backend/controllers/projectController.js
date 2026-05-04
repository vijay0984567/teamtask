const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    }).populate('createdBy', 'name email').populate('members.user', 'name email role');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProject = async (req, res) => {
  const { name, description, color } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required' });

  try {
    const project = await Project.create({
      name, description, color, createdBy: req.user._id,
    });
    await project.populate('createdBy', 'name email');
    await project.populate('members.user', 'name email role');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Only project admins can update' });
    }

    const { name, description, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    await project.save();
    await project.populate('createdBy', 'name email');
    await project.populate('members.user', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Only project admins can delete' });
    }

    await Task.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMember = async (req, res) => {
  const { email, role } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only project admins can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email' });

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await project.save();
    await project.populate('members.user', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  const { userId } = req.params;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Only project admins can remove members' });
    }

    if (userId === project.createdBy.toString()) {
      return res.status(400).json({ message: 'Cannot remove project creator' });
    }

    project.members = project.members.filter(m => m.user.toString() !== userId);
    await project.save();
    await project.populate('members.user', 'name email role');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject, addMember, removeMember, getProjectById };

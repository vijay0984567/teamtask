const Task = require('../models/Task');
const Project = require('../models/Project');

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false, project: null, role: null };
  const member = project.members.find(m => m.user.toString() === userId.toString());
  return { ok: !!member, project, role: member?.role };
};

const getTasks = async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query;
    const filter = {};

    if (projectId) {
      const { ok } = await isProjectMember(projectId, req.user._id);
      if (!ok) return res.status(403).json({ message: 'Access denied' });
      filter.projectId = projectId;
    } else {
      // Return tasks from all user's projects
      const projects = await Project.find({ 'members.user': req.user._id });
      filter.projectId = { $in: projects.map(p => p._id) };
    }

    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;
  if (!title) return res.status(400).json({ message: 'Task title is required' });
  if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

  try {
    const { ok, role } = await isProjectMember(projectId, req.user._id);
    if (!ok) return res.status(403).json({ message: 'Access denied' });
    if (role !== 'Admin') return res.status(403).json({ message: 'Only project admins can create tasks' });

    const task = await Task.create({
      title, description, projectId, assignedTo: assignedTo || null,
      createdBy: req.user._id, status: status || 'Todo',
      priority: priority || 'Medium', dueDate: dueDate || null,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('projectId', 'name color');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { ok, role } = await isProjectMember(task.projectId._id, req.user._id);
    if (!ok) return res.status(403).json({ message: 'Access denied' });

    const isAdmin = role === 'Admin';
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    const { title, description, assignedTo, status, priority, dueDate } = req.body;

    // Members can only update status
    if (!isAdmin) {
      if (status) task.status = status;
    } else {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('projectId', 'name color');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { ok, role } = await isProjectMember(task.projectId, req.user._id);
    if (!ok || role !== 'Admin') {
      return res.status(403).json({ message: 'Only project admins can delete tasks' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map(p => p._id);

    const allTasks = await Task.find({ projectId: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name color');

    const myTasks = allTasks.filter(t => t.assignedTo?._id?.toString() === req.user._id.toString());
    const now = new Date();
    const overdue = allTasks.filter(t => t.dueDate && t.status !== 'Done' && new Date(t.dueDate) < now);

    const byStatus = {
      Todo: allTasks.filter(t => t.status === 'Todo').length,
      'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
      Done: allTasks.filter(t => t.status === 'Done').length,
    };

    res.json({
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      overdueTasks: overdue.length,
      byStatus,
      recentTasks: allTasks.slice(0, 5),
      overdueList: overdue.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getDashboardStats };

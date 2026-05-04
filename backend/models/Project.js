const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  color: { type: String, default: '#6366f1' },
}, { timestamps: true });

// Auto-add creator as Admin member
projectSchema.pre('save', function (next) {
  if (this.isNew) {
    const alreadyMember = this.members.some(
      m => m.user.toString() === this.createdBy.toString()
    );
    if (!alreadyMember) {
      this.members.push({ user: this.createdBy, role: 'Admin' });
    }
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);

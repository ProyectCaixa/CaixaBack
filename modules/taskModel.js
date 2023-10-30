const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['alta', 'baja', 'media'], default: 'media', required: true },
    dateStart: { type: Date, default: Date.now },
    dateEnd: { type: Date },
    completed: { type: Boolean, default: false },
});

const Tasks = mongoose.model('Tasks', tasksSchema);

module.exports = Tasks;
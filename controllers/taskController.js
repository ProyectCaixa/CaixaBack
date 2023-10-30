const Task = require('../modules/taskModel');

const taskController = {
    createTask: async (req, res) => {
        try {
            const { title, description, priority } = req.body;

            const dateEnd = completed ? new Date() : undefined;

            const newTask = new Task({
                title,
                description,
                priority,
                dateEnd,
                completed,
            });

            const savedTask = await newTask.save();

            res.status(201).json(savedTask);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear la tarea' });
        }
    },

    getTasksByPriority: async (req, res) => {
        try {
            const priority = req.params.priority;

            const tasks = await Task.find({ priority })
                .sort({ dateStart: 1 });

            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las tareas por prioridad' });
        }
    }
}

module.exports = taskController
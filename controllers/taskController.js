const Task = require('../modules/taskModel');

const taskController = {
    createTask: async (req, res) => {
        try {
            const { title, description, priority } = req.body;

            const newTask = new Task({
                title: title,
                description: description,
                priority: priority
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

            const tasks = await Task.find({ priority, completed: false })
                .sort({ dateStart: 1 });

            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las tareas por prioridad' });
        }
    },

    getTasksCompleted: async (req, res) => {
        try {
            const tasks = await Task.find({ completed: true })
                .sort({ dateEnd: -1 });

            res.status(200).json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las tareas completadas' });
        }
    },

    completeTask: async (req, res) => {
        try {
            const taskId = req.params.taskId;

            const task = await Task.findById(taskId);

            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            task.completed = true;
            task.dateEnd = new Date();

            const updatedTask = await task.save();

            res.status(200).json(updatedTask);
        } catch (error) {
            res.status(500).json({ error: 'Error al marcar la tarea como completada' });
        }
    }

}

module.exports = taskController
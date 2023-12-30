/**
 * Handles your login routes
 *
 --
 */

import TaskModel from '../../models/Task'
import {
	IRequest, IResponse, INext
} from '../../interfaces/vendors';
import Log from '../../middlewares/Log';

class Task {

	public static async add(req: any, res: any, next: any): Promise<any> {
		Log.info('Here in the task controller #1!');
		try {
			const { dependencies, ...taskData } = req.body;

			let newTask;
			if (dependencies && dependencies.length > 0) {
				const maxSequence = await TaskModel.findOne({ _id: { $in: dependencies } })
					.sort({ sequence: -1 })
					.select('sequence');

				taskData.sequence = maxSequence ? Number(maxSequence.sequence) + 1 : 1;
				newTask = await TaskModel.create({ ...taskData, dependencies });
			} else {
				newTask = await TaskModel.create({ ...taskData, sequence: 0 });
			}

			res.json(newTask);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	public static async get(req: any, res: any, next: any): Promise<any> {
		try {
			const { filterBy, dueDateRangeStart, dueDateRangeEnd, sortBy, asc } = req.query;
			const order = asc == 'true' ? 1 : -1;

			let filterCriteria = {};
			let recommendationCriteria = {};
			let sortCriteria = {};

			// Determine the filtering criteria based on the query parameter
			switch (filterBy) {
				case 'priority':
					// Filter by priority levels
					filterCriteria = { priority: { $in: ['High', 'Medium', 'Low'] } };
					break;
				case 'dueDateRange':
					// Filter tasks within a specified due date range
					if (dueDateRangeStart && dueDateRangeEnd) {
						filterCriteria = { dueDate: { $gte: new Date(dueDateRangeStart), $lte: new Date(dueDateRangeEnd) } };
						recommendationCriteria = { priority: 'High', dueDate: { $gte: new Date(dueDateRangeStart) } };
					}
					break;
				default:
					// No specific filtering
					break;
			}

			// Determine the sorting criteria based on the query parameter
			switch (sortBy) {
				case 'priority':
					sortCriteria = { priority: order }; // 1 for ascending order
					break;
				case 'dueDate':
					sortCriteria = { dueDate: order };
					break;
				case 'creationDate':
					sortCriteria = { createdAt: order };
					break;
				case 'completionStatus':
					sortCriteria = { status: order };
					break;
				default:
					// Default sorting by creation date
					sortCriteria = { createdAt: 1 };
			}

			const [filteredTasks, recommendedTasks] = await Promise.all([
				TaskModel.find(filterCriteria).sort(sortCriteria).populate('dependencies'),
				TaskModel.find(recommendationCriteria).limit(2).sort({ dueDate: 1 }).populate('dependencies'),
			]);

			const tasksWithOverdueFlag = filteredTasks.map(task => ({
				...task.toObject(),
				overdue: task['overdue'],
			}));


			res.json({ tasksWithOverdueFlag, recommendedTasks });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	public static async update(req: any, res: any, next: any): Promise<any> {
		try {
			const taskId = req.params.id;
			const { dependencies, status, ...updatedTaskData } = req.body;

			// Fetch the task and its dependencies
			const [task, dependentTasks] = await Promise.all([
				TaskModel.findById(taskId),
				dependencies ? TaskModel.find({ _id: { $in: dependencies } }) : [],
			]);

			// Check if dependent tasks are pending
			const dependentTasksPending = dependentTasks.some(depTask => depTask.status === 'Pending');

			if (dependentTasksPending) {
				return res.status(400).json({ error: 'Cannot mark task as completed with pending dependencies.' });
			}

			updatedTaskData.status = status;

			if (dependencies && dependencies.length > 0) {
				const maxSequence = await TaskModel.findOne({ _id: { $in: dependencies } })
					.sort({ sequence: -1 })
					.select('sequence');

				updatedTaskData.sequence = maxSequence ? Number(maxSequence.sequence) + 1 : 1;
			} else {
				updatedTaskData.sequence = 0;
			}

			const updatedTask = await TaskModel.findByIdAndUpdate(taskId, updatedTaskData, { new: true });
			res.json(updatedTask);
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	public static async delete(req: any, res: any, next: any): Promise<any> {
		try {
			const taskId = req.params.id;
			await TaskModel.findByIdAndDelete(taskId);
			res.json({ message: 'Task deleted successfully' });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

export default Task;

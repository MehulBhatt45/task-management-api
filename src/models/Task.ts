/**
 * Define Task model
 *
 --
 */


import { ITask } from '../interfaces/models/task';
import mongoose from '../providers/Database';



// Define the Task Schema
export const TaskSchema = new mongoose.Schema<ITask>({
	title: String,
	description: String,
	priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
	dueDate: Date,
	status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
	dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
	sequence: Number,
}, {
	timestamps: true
});

TaskSchema.virtual('overdue').get(function () {
	const currentDate = new Date();
	return this.dueDate && this.dueDate < currentDate;
});

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;

/**
 * Define interface for Task Model
 *
 --
 */

export interface ITask {
	title: String,
	description: String,
	priority: { type: String, enum: ['High', 'Medium', 'Low'] },
	dueDate: Date,
	status: { type: String, enum: ['Pending', 'Completed'] },
	dependencies: [],
	sequence: Number,
}

export default ITask;

/**
 * Define all your routes
 *
 --
 */

import { Application } from 'express';
import Locals from './Locals';
import Log from '../middlewares/Log';
import taskRouter from './../routes/Task';

class Routes {

	public mountTask(_express: Application): Application {
		const apiPrefix = Locals.config().apiPrefix;
		Log.info('Routes :: Mounting API Routes...');

		return _express.use(`/tasks`, taskRouter);
	}
}

export default new Routes;

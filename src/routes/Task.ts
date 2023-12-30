/**
 * Define all your Web routes
 *
 --
 */

import { Router } from 'express';

import Cache from './../providers/Cache';

import TaskController from '../controllers/Task/Task';

const router = Router();
const cache = Cache.cache;

router.post('/add', TaskController.add);

router.get('/get', cache(10), TaskController.get);

router.put('/update/:id', TaskController.update);

router.delete('/delete/:id', TaskController.delete);

export default router;

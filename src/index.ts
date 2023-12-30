/**
 * Bootstrap your App
 *
 --
 */

import * as os from 'os';
import * as cluster from 'cluster';

import App from './providers/App';


/**
 * Run the Database pool
 */
App.loadDatabase();

/**
 * Run the Server on Clusters
 */
App.loadServer();

import { MongoClient, Db, ObjectId } from 'mongodb';

import { Player } from './class/player';
import { Grid } from './class/grid';

export const players = new Map<ObjectId, Player>();
export const grid: Grid = Grid.generate();

export const db = require('mongo-lazy-connect')('mongodb://localhost:27017');
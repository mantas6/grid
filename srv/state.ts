import { MongoClient, Db, ObjectId } from 'mongodb';

import { Player } from './class/player';
import { Grid } from './class/grid';

export const players = new Map<ObjectId, Player>();
export const grid: Grid = Grid.generate();

/*
class DbClient {
    public db: Db;

    constructor() {
        MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true })
            .then(client => {
                this.db = client.db('grid');
            });
    }
}

export const dbClient = new DbClient();
*/

export const db = require('mongo-lazy-connect')('mongodb://localhost:27017/grid', { useNewUrlParser: true });
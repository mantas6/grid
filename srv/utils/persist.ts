import { grid, players } from '../state';
import { readFileSync, writeFile } from 'fs';
import { plainToClass, classToPlain } from 'class-transformer';

import { Log } from '../utils/log';

const log = new Log('persist');

export function saveState() {
    const playersPlain = [];

    for (const player of players) {
        playersPlain.push(classToPlain(player));
    }

    const state = { players: playersPlain };

    const json = JSON.stringify(state);

    writeFile('storage/state.json', json, err => {
        if (err) {
            log.error('Failed to save state');
        } else {
            log.complete('Saved game state OK');
        }
    });
}

export function loadState() {
    log.info('Reading state');

    let json;

    try {
        json = readFileSync('storage/state.json').toString();
    } catch (err) {
        return log.warn('Error reading from file');
    }

    if (!json) {
        log.warn('Empty JSON string');
    }

    const state = JSON.parse(json);

    players.clear();

    for (const [playerId, player] of state.players) {
        players.set(playerId, player);
    }

    log.complete('Loaded state');
}
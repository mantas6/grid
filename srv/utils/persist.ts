import { grid, players } from '../state';
import { readFileSync, writeFile, exists } from 'fs';
import { plainToClass, classToPlain } from 'class-transformer';

import { Log } from '../utils/log';
import { Player } from '../class/player';

const log = new Log('persist');

export function saveState() {
    const playersPlain = [];

    for (const player of [...players]) {
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

    const playersClasses = plainToClass(Player, state.players);

    for (const player of playersClasses) {
        log.debug(`Un-serializing player of ${player.id}`);
        players.set(player.id, player);
    }

    log.complete('Loaded state');
}
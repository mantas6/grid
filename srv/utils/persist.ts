import { grid, players } from '../state';
import { readFileSync, writeFile, exists } from 'fs';
import { plainToClass, classToPlain } from 'class-transformer';

import { Log } from '../utils/log';
import { Player } from '../class/player';
import { Cell } from '../class/cell';

const log = new Log('persist');

export function saveState() {
    const playersPlain = [];

    for (const [ playerId, player ] of players) {
        playersPlain.push(classToPlain(player));
    }

    const mapPlain = classToPlain(grid.map);

    const state = { players: playersPlain, map: mapPlain };

    putState(state);
}

export function loadState() {
    const state = getState();

    if (!state)
        return;

    players.clear();

    const playersClasses = plainToClass(Player, state.players);

    for (const player of playersClasses) {
        log.debug(`Un-serializing player of ${player.id}`);
        players.set(player.id, player);
    }

    grid.map = plainToClass(Cell, state.map) as any;

    log.complete('Loaded state');
}



function putState(state) {
    const json = JSON.stringify(state);

    writeFile('storage/state.json', json, err => {
        if (err) {
            log.error('Failed to save state');
        } else {
            log.complete('Saved game state OK');
        }
    });
}

function getState() {
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

    return state;
}
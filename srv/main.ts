import 'reflect-metadata';

import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import * as createSocket from 'socket.io';
import { Signale } from 'signale';

import { fromEvent, timer, interval, Subject, Subscription } from 'rxjs';
import { filter, throttleTime, map, tap, mergeMap, switchMap, throttle, startWith } from 'rxjs/operators';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { shuffle, pick, range, random, head, clamp, find, includes, entries, sample, remove, round, difference } from 'lodash';

const randomBytesPromise = promisify(randomBytes);

const log = new Signale({ scope: 'main' });

log.success('Starting');

const { SSL_KEY, SSL_CERT, SSL_CA, PRODUCTION } = process.env;

if (PRODUCTION) {
    (log as any).disable();
}

let server;

if (SSL_KEY && SSL_CERT) {
    server = createHttpsServer({
        key: readFileSync(SSL_KEY, "utf-8"),
        cert: readFileSync(SSL_CERT, "utf-8"),
        // ca: readFileSync(SSL_CA, "utf-8")
    });
} else {
    server = createHttpServer();
}

const options = {
    path: '/',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
};

const io = createSocket(server, options);

const serverPort = 3051;

server.listen(serverPort, () => {
    log.note(`Server is listening on ${serverPort}`);
});

interface Stat {
    name: string;
    current: number;
    max: number;
}


interface StatUpdate {
    stat: Stat;
}

interface Player {
    token: string;
    stats: Stat[];
    statUpdate: Subject<StatUpdate>;
}

interface Cell {
    x: number;
    y: number;

    type?: string;
    occupiable?: boolean;

    playerId?: number;
    strength?: number;
}

interface GridUpdate {
    cell: Cell;
}

interface Grid {
    name: string;
    map: Cell[][];
    update: Subject<GridUpdate>;
}

const players = new Map<number, Player>();
const playersOnlineIds = new Set<number>();
//const players: {[id: number]: Player} = {};
const grids: Grid[] = [];

io.on('connection', client => {
    let clientPlayerId: number;
    let clientPlayer: Player;

    let clientGridRef: Grid;
    let clientGridSub: Subscription;
    
    log.note('Client connected');

    fromEvent(client, 'login', (req, ack) => ({ req, ack }))
        .pipe(
            filter(({ req, ack }) => req && ack),
            filter(_ => !clientPlayer),
            filter(({ req }) => !playersOnlineIds.has(req.id) || (client.emit('duplicateSession') && false)),
            tap(({ req }) => log.debug(`Received login ${req.id} with token ${req.token}`)),
            switchMap(async ({ req, ack }) => {
                let id = req.id;
                let token = req.token;

                const foundPlayer = players.get(req.id);

                if (!foundPlayer || foundPlayer.token != token) {
                    log.debug(`Creating a new player`);
    
                    const buffer = await randomBytesPromise(48);
    
                    token = buffer.toString("hex");
    
                    clientPlayer = { 
                        token,
                        statUpdate: new Subject<StatUpdate>(),
                        ...initialPlayer(),
                    };

                    id = generatePlayerId();

                    log.note(`Created new player  ${id} with token ${token}`);

                    players.set(id, clientPlayer);
                } else {
                    clientPlayer = players.get(req.id);
                }

                clientPlayer.statUpdate.subscribe(update => client.emit('statUpdate', update));
                // Death handler
                
                clientPlayer.statUpdate.subscribe(({ stat }) => stat.name == 'health' && stat.current <= 0 && handlePlayerDeath());
                
                for (const { name } of clientPlayer.stats) {
                    affectStat(clientPlayer, name, 0);
                }

                clientPlayerId = id;

                playersOnlineIds.add(clientPlayerId);

                return { id, token, ack };
            }),
            tap(_ => assignGrid()),
            tap(_ => assignPosition()),
            tap(_ => {
                clientPlayer.statUpdate.subscribe(({ stat }) => {
                    if (stat.name == 'health' && stat.current > 0) {
                        const cell = findCellByPlayerId(clientPlayerId);

                        if (cell) {
                            updateCell(cell, 'player', false, { playerId: clientPlayerId });
                            clientGridRef.update.next({ cell });
                        }
                    }
                });
            })
        )
        .subscribe(({ id, token, ack }) => {
            ack({ id, token });
        });

    fromEvent(client, 'disconnect').subscribe(() => {
        unrefPosition();

        if (clientPlayerId) {
            playersOnlineIds.delete(clientPlayerId);
        }

        log.note('Client disconnected');
    });

    fromEvent(client, 'changePosition')
        .pipe(
            throttleTime(1000),
            filter(_ => !!clientPlayer),
            filter((req: any) => req),
            filter(({ x, y }) => typeof(x) == 'number' && typeof(y) == 'number'),
            filter(({ x, y }) => x >= 0 && y >= 0),
            filter((req: any) => req && req.x < clientGridRef.map.length && req.y < head(clientGridRef.map).length),
            tap((req: any) => log.debug(`Position change request ${req.x} ${req.y}`)),
            filter(({ x, y }) => assignPosition({ x, y }, true)),
            filter(coords => affectStat(clientPlayer, 'magic', -1 * measureDistance(findCellByPlayerId(clientPlayerId), coords))),
            tap(_ => unrefPosition()),
            tap(({ x, y }) => assignPosition({ x, y }))
        )
        .subscribe();
    
    fromEvent(client, 'attack')
        .pipe(
            throttleTime(1000),
            filter(_ => !!clientPlayer),
            filter((req: any) => req),
            filter(({ x, y }) => typeof(x) == 'number' && typeof(y) == 'number'),
            filter(({ x, y }) => x >= 0 && y >= 0),
            map(({ x, y }) => findCellByCoords(x, y)),
            filter(cell => !!cell),
            filter(cell => !!cell.playerId),
            map(cell => ({ cell, distance: measureDistance(findCellByPlayerId(clientPlayerId), cell) })),
            filter(({ cell, distance }) => affectStat(clientPlayer, 'magic', -1 * distance)),
            tap(({ cell }) => log.info(`attacking player ${cell.playerId}`)),
            map(bundle => ({ ...bundle, player: players.get(bundle.cell.playerId) })),
            filter(({ player }) => !!player),
            filter(({ player, cell, distance }) => affectStat(player, 'health', -10 / distance, true))
        )
        .subscribe();
    
    fromEvent(client, 'changeGrid')
        .pipe(
            throttleTime(1000),
            filter(_ => !!clientPlayer),
            filter(_ => affectStat(clientPlayer, 'magic', -25)),
            tap(_ => log.info(`Changing grid`)),
            tap(_ => assignGrid() && assignPosition())
        )
        .subscribe();

    function handlePlayerDeath() {
        // Reset stats
        for (const stat of clientPlayer.stats) {
            affectStat(clientPlayer, stat.name, stat.max - stat.current);
        }

        const graveCell = findCellByPlayerId(clientPlayerId);
        const gridRef = clientGridRef;
        
        assignGrid();
        assignPosition();

        updateCell(graveCell, 'grave', false);
        gridRef.update.next({ cell: graveCell });
    }

    function assignGrid() {
        if (clientGridSub) {
            clientGridSub.unsubscribe();
            unrefPosition();
        }

        for (const grid of shuffle(grids)) {
            if (countGridOccupiableCells(grid) > 0) {
                client.emit('gridChange', { grid: pick(grid, ['map', 'name']) });
                clientGridRef = grid;
                clientGridSub = grid.update.subscribe(update => client.emit('gridUpdate', update));
                return true;
            }
        }

        return false;
    }

    function assignPosition(position?: { x, y }, soft: boolean = false) {
        if (!clientGridRef) {
            return;
        }
        
        for (const lineX of shuffle(clientGridRef.map)) {
            for (const cell of shuffle(lineX)) {
                if (!position || cell.x == position.x && cell.y == position.y) {
                    if (cell.occupiable) {
                        if (!soft) {
                            if (cell.type) {
                                handleCellInteraction(cell);
                            }

                            updateCell(cell, 'player', false, { playerId: clientPlayerId });
                            clientGridRef.update.next({ cell });
                            log.debug(`Assigning player to cell ${cell.x} ${cell.y}`);
                        }
                        return true;
                    }
                }
            }
        }

        return false;
    }

    function unrefPosition() {
        if (!clientGridRef) {
            return;
        }

        const cell = findCellByPlayerId(clientPlayerId);

        if (cell) {
            log.debug(`Player unref X ${cell.x} Y ${cell.y}`);
            updateCell(cell);
            clientGridRef.update.next({ cell });
        }
    }

    function findCellByPlayerId(playerId: number): Cell {
        for (const [x, lineX] of clientGridRef.map.entries()) {
            for (const [y, cell] of lineX.entries()) {
                if (cell.playerId && cell.playerId == playerId) {
                    return cell;
                }
            }
        }
    }

    function findCellByCoords(x: number, y: number) {
        for (const lineX of clientGridRef.map) {
            for (const cell of lineX) {
                if (cell.x == x && cell.y == y) {
                    return cell;
                }
            }
        }
    }

    function handleCellInteraction(cell: Cell) {
        switch (cell.type) {
            case 'healthPotion':
                affectStatByPercent(clientPlayer, 'health', 0.1, true);
                break;
            case 'magicPotion':
                affectStatByPercent(clientPlayer, 'magic', 0.1, true);
                break;
        }
    }
});

const everyTenSeconds = timer(0, 10e3);
const everyMinute = timer(60e3, 60e3);

const minimumGridCount = 5;

everyTenSeconds.subscribe(function gridGeneration() {
    let availableCount = 0;

    for (const grid of grids) {
        availableCount += countGridOccupiableCells(grid);
    }

    if (grids.length < minimumGridCount || availableCount < 32) {
        grids.push(createGrid());
    }
});

everyMinute.subscribe(function gridDestruction() {
    if (grids.length > minimumGridCount) {
        for (const [gridIndex, grid] of grids.entries()) {
            const count = countGridCellTypes(grid, 'player');

            if (!count) {
                grids.splice(gridIndex, 1);
                log.complete(`Cleared empty grid ${gridIndex}`);
                break;
            }
        }
    }
});

function affectStatByPercent(player: Player, name: string, percent: number, fill: boolean = false) {
    const stat = find(player.stats, { name });
    const diff = stat.max * percent;

    affectStat(player, name, diff, fill);
}

function affectStat(player: Player, name: string, diff: number, fill: boolean = false) {
    log.note(`Affecting stat ${name} by ${diff}`);

    const stat = find(player.stats, { name });

    if (stat.current + diff < 0 && !fill)
        return false;
    
    if (stat.current + diff > stat.max && !fill)
        return false;
    
    stat.current = clamp(stat.current + diff, 0, stat.max);

    player.statUpdate.next({ stat });

    return true;
}

function createGrid(): Grid {
    const map: Cell[][] = [];

    const sizeX = 8;
    const sizeY = 8;

    for (const x of range(0, sizeX)) {
        if (!map[x]) {
            map.push([]);
        }

        for (const y of range(0, sizeY)) {
            const type = generateCellType();

            if (type != 'empty') {
                log.note(`Generating special type ${type}`);
                map[x].push(updateCell({ x, y }, type));
            } else {
                map[x].push(updateCell({ x, y }));
            }
        }
    }

    log.complete(`Creating grid of size X is ${sizeX} Y is ${sizeY}`);

    const update = new Subject<GridUpdate>();

    const names = [
        'Forbidden Cave',
        'Reflection Room',
        'Fractured Retina',
        'Burning Dream',
        'Tight-spaced Narrow-minded Dream',
        'Weeping Hall',
        'Circle-minded Collective Reality',
        'Frost-rise Bunker',
        'Four-AM Awake',
    ];

    const usedNames = grids.map(grid => grid.name);
    const availableNames = difference(names, usedNames);
    const name = sample(availableNames);

    return { map, update, name };
}

function countGridCellTypes(grid: Grid, ...types: string[]): number {
    let count = 0;

    for (const lineX of grid.map) {
        for (const cell of lineX) {
            if (includes(types, cell.type)) {
                count++;
            }
        }
    }

    return count;
}

function countGridOccupiableCells(grid: Grid): number {
    let count = 0;

    for (const lineX of grid.map) {
        for (const cell of lineX) {
            if (cell.occupiable) {
                count++;
            }
        }
    }

    return count;
}

function updateCell(cell: Cell, type: string = undefined, occupiable: boolean = true, additional: { playerId?: number, strength?: number } = {}) {
    cell.type = type;
    cell.occupiable = occupiable;
    cell.playerId = additional.playerId;

    if (additional.playerId && !additional.strength) {
        const stat = find(players.get(additional.playerId).stats, { name: 'health' });
        const strength = round(stat.current / stat.max * 100);
        cell.strength = strength;
    } else {
        cell.strength = additional.strength;
    }

    return cell;
}

function generateCellType(): string {
    const types = {
        empty: 100,
        healthPotion: 25,
        magicPotion: 25,
    };

    const chances = [];

    for (const [type, count] of entries(types)) {
        chances.push(...new Array(count).fill(type));
    }

    return sample(chances);
}

function generatePlayerId() {
    let highestId = 0;

    for (const id of players.keys()) {
        if (id > highestId) {
            highestId = id;
        }
    }

    return ++highestId;
}

function initialPlayer() {
    return {
        stats: [
            { name: 'health', current: 100, max: 100 },
            { name: 'magic', current: 100, max: 100 },
        ]
    };
}

function measureDistance(a: { x: number, y: number }, b: { x: number, y: number }) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
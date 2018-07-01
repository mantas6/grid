import 'reflect-metadata';

import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import * as createSocket from 'socket.io';

import { fromEvent, timer,  } from 'rxjs';
import { filter, throttleTime, map, tap, mergeMap, switchMap, throttle, startWith } from 'rxjs/operators';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { readFileSync } from 'fs';

import { Player } from './class/player';

import { grid, players, playersOnlineIds } from './state';
import { Log } from './utils/log';
import { saveState, loadState } from './utils/persist';

const randomBytesPromise = promisify(randomBytes);

const log = new Log('main');

log.success('Starting');

// loadState();

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

    log.note('Using HTTPS');
} else {
    server = createHttpServer();

    log.note('Using HTTP');
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

io.on('connection', client => {
    let clientPlayer: Player;
    
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

                    id = Player.generatePlayerId();
                    log.note(`Created new player  ${id} with token ${token}`);

                    clientPlayer = new Player();
                    clientPlayer.token = token;
                    clientPlayer.id = id;

                    players.set(id, clientPlayer);
                } else {
                    clientPlayer = players.get(req.id);
                }

                //clientPlayer.statUpdate.subscribe(update => client.emit('statUpdate', update));
                // Death handler
                
                //clientPlayer.statUpdate.subscribe(({ stat }) => stat.name == 'health' && stat.current <= 0 && handlePlayerDeath());
                
                /*for (const { name } of clientPlayer.stats) {
                    affectStat(clientPlayer, name, 0);
                }*/

                clientPlayer.logOn(client);
                playersOnlineIds.add(clientPlayer.id);
                io.emit('onlineCount', { count: playersOnlineIds.size });

                return { id, token, ack };
            }),
            tap(_ => clientPlayer.assignCell(grid.findCellOccupiable()))
        )
        .subscribe(({ id, token, ack }) => {
            ack({ id, token });
        });

    fromEvent(client, 'disconnect').subscribe(() => {
        if (clientPlayer) {
            clientPlayer.logOff();
            playersOnlineIds.delete(clientPlayer.id);
            io.emit('onlineCount', { count: playersOnlineIds.size });
        }

        log.note('Client disconnected');
    });

    fromEvent(client, 'changePosition')
        .pipe(
            throttleTime(1000),
            filter(_ => !!clientPlayer),
            filter(req => !!req),
            filter(({ x, y }) => !isNaN(x) && !isNaN(y)),
            filter(({ x, y }) => x >= 0 && y >= 0),
            map(req => ({ ...req, cell: grid.getCell(req.x, req.y) })),
            filter(({ cell }) => !!cell),
            map(bundle => ({ ...bundle, distance: measureDistance(clientPlayer.cell, bundle.cell) })),
            filter(({ distance }) => clientPlayer.getStat('magic').affectByDiff(-distance)),
            tap(bundle => log.debug(`Position change request ${bundle.x} ${bundle.y}`)),
            tap(({ cell }) => clientPlayer.assignCell(cell))
        )
        .subscribe();
    
        /*
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

    fromEvent(client, 'reset')
        .pipe(
            throttleTime(1000),
            filter(_ => !!clientPlayer),
            tap(_ => log.info(`Resetting`)),
            tap(_ => handlePlayerDeath())
        )
        .subscribe();
        */
});

const everyMinute = timer(60e3, 60e3);
const everyFiveSeconds = timer(5e3, 5e3);

everyFiveSeconds.subscribe(() => saveState());



function measureDistance(a: { x: number, y: number }, b: { x: number, y: number }) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
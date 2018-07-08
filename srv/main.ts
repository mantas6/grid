import 'reflect-metadata';

import { createServer as createHttpServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import * as createSocket from 'socket.io';

import { fromEvent, timer, interval,  } from 'rxjs';
import { filter, throttleTime, map, tap, mergeMap, switchMap, throttle, startWith, bufferTime, debounce } from 'rxjs/operators';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { readFileSync } from 'fs';

import { Player } from './class/player';
import { Cell } from './class/cell';

import { grid, players, playersOnlineIds } from './state';
import { Log } from './utils/log';
import { saveState, loadState } from './utils/persist';
import { measureDistance } from './utils/method';

const randomBytesPromise = promisify(randomBytes);

const log = new Log('main');

log.success('Starting');


const { SSL_KEY, SSL_CERT, SSL_CA, NO_PERSIST } = process.env;

if (!NO_PERSIST) {
    loadState();
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

    const generalValidation = [
        // throttle(() => timer(250)),
        filter(_ => !!clientPlayer),
        filter(req => !!req),
    ];

    fromEvent(client, 'login', (req, ack) => ({ req, ack }))
        .pipe(
            filter(({ req, ack }) => req && ack),
            filter(_ => !clientPlayer),
            // Also check for token ==
            filter(({ req }) => (!playersOnlineIds.has(req.id) || players.get(req.id).token != req.token) || (client.emit('duplicateSession') && false)),
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

                    clientPlayer = Player.create(id);
                    clientPlayer.token = token;
                    // clientPlayer.id = id;

                    players.set(id, clientPlayer);
                } else {
                    clientPlayer = players.get(req.id);
                }

                clientPlayer.logOn(client);
                playersOnlineIds.add(clientPlayer.id);
                io.emit('onlineCount', { count: playersOnlineIds.size });

                return { id, token, ack };
            }),
            tap(_ => clientPlayer.assignCell(clientPlayer.cell.get() || grid.findCellOccupiable()))
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
            ...generalValidation,
            filter(({ x, y }) => !isNaN(x) && !isNaN(y)),
            map(req => ({ ...req, cell: grid.getCell(req.x, req.y) })),
            filter(({ cell }) => !!cell),
            filter(({ cell }) => (<Cell>cell).isOccupiable() || (<Cell>cell).isAbsorbable()),
            map(bundle => ({ ...bundle, distance: measureDistance(clientPlayer.cell.get(), bundle.cell) })),
            filter(({ distance }) => distance == 1),
            filter(({ cell }) => clientPlayer.getStat('energy').affectByDiff(-1 * clientPlayer.getActionCost(cell)) || clientPlayer.getStat('health').affectByDiff(-1 * clientPlayer.getActionCost(cell))),
            tap(bundle => log.debug(`Position change request ${bundle.x} ${bundle.y}`)),
            tap(({ cell }) => {
                const targetCell = cell as Cell;

                if (targetCell.isOccupiable()) {
                    clientPlayer.assignCell(cell);
                } else if(targetCell.isAbsorbable()) {
                    if (targetCell.player) {
                        clientPlayer.absorbCellWithPlayer(targetCell);
                    } else if (targetCell.item) {
                        clientPlayer.absorbCellWithItem(targetCell);
                    } else {
                        clientPlayer.absorbCellWithContent(targetCell);
                    }
                }
            })
        )
        .subscribe();
    
    fromEvent(client, 'useItem')
        .pipe(
            ...generalValidation,
            filter(({ index }) => !isNaN(index)),
            filter(({ index }) => clientPlayer.inventory.hasItem(index)),
            tap(({ index }) => clientPlayer.inventory.useItem(index))
        )
        .subscribe();

    fromEvent(client, 'dropItem')
        .pipe(
            ...generalValidation,
            filter(({ index }) => !isNaN(index)),
            filter(({ index }) => clientPlayer.inventory.hasItem(index)),
            tap(({ index }) => clientPlayer.inventory.dropItem(index))
        )
        .subscribe();
});

const everyMinute = timer(60e3, 60e3);
const everyFiveSeconds = timer(5e3, 5e3);

if (!NO_PERSIST) {
    everyFiveSeconds.subscribe(() => saveState());
}
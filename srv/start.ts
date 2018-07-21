import { spawn, ChildProcess } from 'child_process';
import { defaults } from 'request';

const request = defaults({ jar: true })

let handle: ChildProcess; 

start();

function start() {
    handle = spawn('ts-node', ['srv/main.ts']);
    handle.on('exit', () => start());

    handle.stdout.on('data', buffer => message(buffer.toString()));
    handle.stderr.on('data', buffer => message(buffer.toString()));
    handle.on('error', err => message(err.message.toString()))
}

function message(msg: string) {
    const splitByNewLines = msg.split('\n');

    let hasAdded: boolean = false;
    
    for (const line of splitByNewLines) {
        if (line.includes('<#> ')) {
            const [ namespace, level, message ] = line.split('<#> ').join('')
                .split('[').join('')
                .split(']').join('')
                .split(' => ');

            console.log(`[${namespace}] => ${level} => ${message}`)
            saveLog(namespace, level, message);
            hasAdded = true;
        }
    }

    if (!hasAdded) {
        console.log(msg)
        saveLog('global', 'critical', msg);
    }
}

let awaitingSession = true;

collect({}, () => awaitingSession = false)

function saveLog(namespace, level, message) {
    if (!namespace || !level || !message || awaitingSession) return;

    collect({
        name: 'log',
        tags: [ level ],
        titles: { namespace },
        attachments: { message },
    });
}

setInterval(() => {
    collect();
}, 10e3)

function collect(data?, cb?) {
    if (!process.env.PRODUCTION)
        return;

    const params = {
        method: 'post',
        headers: { 'User-Agent' : 'Server' },
        json: {
            site: 'Grid Server',
            token: 'gEZ192vwXourImp65h0xPft7CtEUykxW4OjiN8Jl61DiTr3f48YZBTqJ1njV4oMtoPvFeNbhs5ttgLAax3EOsF64K5uxk3aR60Nx',
            events: data ? [{...data}] : undefined,
        },
    };

    request('https://m.7777.lt/a_sites/entry', params, (err, res) => {
        if(cb) cb();
    });
}

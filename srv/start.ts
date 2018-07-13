import { spawn, ChildProcess } from 'child_process';
import { defaults } from 'request';

const request = defaults({ jar: true })

let handle: ChildProcess; 

start();

handle.on('exit', () => start());

handle.stdout.on('data', buffer => message(buffer.toString()));
handle.stderr.on('data', buffer => message(buffer.toString()));
handle.on('error', err => message(err.message.toString()))

function start() {
    handle = spawn('ts-node', ['srv/main.ts']);
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

function saveLog(namespace, level, message) {
    if (!namespace || !level || !message) return;
    
    const params = {
        method: 'post',
        headers: { 'User-Agent' : 'Server' },
        json: {
            site: 'Grid',
            events: [
                {
                    name: 'log',
                    tags: [ level ],
                    titles: { namespace },
                    attachments: { message },
                }
            ],
        },
    };

    request('http://logging.back/a_sites/entry', params, (err, res) => {
        
    });
}

setInterval(() => {
    const params = {
        method: 'post',
        headers: { 'User-Agent' : 'Server' },
        json: {
            site: 'Grid',
        },
    };

    request('http://logging.back/a_sites/entry', params, (err, res) => {
        
    });
}, 10e3)

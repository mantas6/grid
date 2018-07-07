import { spawn, ChildProcess } from 'child_process';
import { defaults } from 'request';

const request = defaults({ jar: true })

let handle: ChildProcess; 

start();

handle.on('exit', () => start());

handle.stdout.on('data', buffer => message(buffer.toString()));
handle.stderr.on('data', buffer => message(buffer.toString()));
handle.on('error', err => message(err.message))

function start() {
    handle = spawn('ts-node', ['srv/main.ts']);
}

function message(msg: string) {
    const splitByNewLines = msg.split('\n');
    
    for (const line of splitByNewLines) {
        if (line.includes('<#> ')) {
            const [ namespace, level, message ] = line.split('<#> ').join('')
                .split('[').join('')
                .split(']').join('')
                .split(' => ');

            console.log(`[${namespace}] => ${level} => ${message}`)
            //saveLog(namespace, level, message);
        } else {
            console.log(msg)
            //saveLog('global', 'critical', message);
        }
    }
}
/*
function saveLog(namespace, level, message) {
    const params = {
        method: 'post',
        headers: { 'User-Agent' : 'Server' },
        json: {
            site: 'Grid',
            events: [
                {
                    name: 'log',
                    tags: [ level ],
                    attachments: {
                        message: message,
                    },
                }
            ],
        },
    };

    request('http://logging.back/a_sites/collect', params, (err, res) => {
        
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

    request('http://logging.back/a_sites/collect', params, (err, res) => {
        
    });
}, 5e3)
*/
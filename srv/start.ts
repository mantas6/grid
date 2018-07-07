import { spawn, ChildProcess } from 'child_process';
import { request } from 'https';

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
        } else {
            // Unexpected/Error/Warning/Crash logs
        }
    }
}

// request()
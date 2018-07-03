import { spawn, ChildProcess } from 'child_process';

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
    console.log(msg.replace("\n", ""));
}
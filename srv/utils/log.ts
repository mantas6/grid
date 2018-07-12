import { of } from 'rxjs';

const { PRODUCTION } = process.env;

export class Log {
    namespace: string;
    constructor(namespace: string) {
        this.namespace = namespace;
    }

    error(...messages: string[]) {
        this.push('error', messages);
    }

    warn(...messages: string[]) {
        this.push('warn', messages);
    }

    info(...messages: string[]) {
        this.push('info', messages);
    }

    success(...messages: string[]) {
        this.push('success', messages);
    }

    complete(...messages: string[]) {
        this.push('complete', messages);
    }

    note(...messages: string[]) {
        this.push('note', messages);
    }

    debug(...messages: string[]) {
        this.push('debug', messages);
    }

    push(level: string, messages: string[]) {
        if (PRODUCTION) {
            if (['error', 'warn', 'info', 'complete', 'success'].indexOf(level) == -1)
                return;
        }

        console.log(`<#> [${this.namespace}] => ${level} => ${messages.join('')}`);
    }
}
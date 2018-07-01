export class Log {
    namespace: string;
    constructor(namespace: string) {
        this.namespace = namespace;
    }

    error(message: string) {
        this.push('error', message);
    }

    warn(message: string) {
        this.push('warn', message);
    }

    info(message: string) {
        this.push('info', message);
    }

    success(message: string) {
        this.push('success', message);
    }

    complete(message: string) {
        this.push('complete', message);
    }

    note(message: string) {
        this.push('note', message);
    }

    debug(message: string) {
        this.push('debug', message);
    }

    push(level: string, message: string) {
        console.log(`[${this.namespace}] => ${level} => ${message}`);
    }
}
import * as util from "util";
import * as vscode from 'vscode';


class Logger {
    readonly channel = vscode.window.createOutputChannel("TFLint", { log: true });

    error(...messages: unknown[]): void {
        console.log(...messages);
        this.channel.error(util.format(...messages));
    }
    info(...messages: unknown[]): void {
        console.log(...messages);
        this.channel.info(util.format(...messages));
    }
    warn(...messages: unknown[]): void {
        console.log(...messages);
        this.channel.warn(util.format(...messages));
    }
    debug(...messages: unknown[]): void {
        console.log(...messages);
        this.channel.debug(util.format(...messages));
    }
    trace(...messages: unknown[]): void {
        console.log(...messages);
        this.channel.trace(util.format(...messages));
    }
}


export const logger: Logger = new Logger();

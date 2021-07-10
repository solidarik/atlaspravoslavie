const chalk = require('chalk');
const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, colorize, splat, printf } = format;

class Log {
    static create(fileName = undefined) {
        return new Log(fileName)
    }

    constructor(fileName = undefined) {

        const myFormat = printf(info => {
            return `${moment().format('YYYY-MM-DD hh:mm:ss').trim()} ${info.level}: ${info.message}`;
        });

        let logTransports = [new transports.Console()]
        if (fileName) {
            logTransports.push(new transports.File({ filename: fileName }))
        }

        const log = createLogger({
            format: combine(
                splat(),
                colorize(),
                myFormat
            ),
            transports: logTransports
        });

        this.log = log;
    }

    info(text) {
        this.log.log('info', text);
    }

    error(text, err) {
        if (err)
            this.log.log('error', [chalk.red(text), err].join(', '));
        else
            this.log.log('error', chalk.red(text));
    }

    warn(text) {
        this.log.log('warn', text);
    }

    success(text) {
        log.info(chalk.blue(text));
    }

    boom(text) {
        log.info(chalk.magenta(text));
    }
}

warn = (text) => { log.warn(text); }
info = (text) => { log.info(text); }
error = (text, err) => { log.error(text, err) }
warn = (text) => { log.warn(text); }
success = (text) => { log.success(text); }
boom = (text) => { log.boom(text); }

module.exports = Log;
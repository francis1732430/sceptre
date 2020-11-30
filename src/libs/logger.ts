import Conf from "./config";
import {Utils} from "./utils";
import * as trace from "stack-trace";
import * as winston from "winston";
import * as path from "path";
import {LogOption} from "./config";

export class Logger {
    private httpLogger: winston.LoggerInstance;
    private processLogger: winston.LoggerInstance;
    private logFolder: string;

    constructor(opts: LogOption) {
        this.logFolder = ".";
        this.init(opts || {});
    }

    public getTransportLogger(): winston.LoggerInstance {
        return this.httpLogger;
    }

    public error(message: string, meta?: any) {
        if (meta != null) {
            if (meta instanceof Error && meta.stack != null) {
                this.processLogger.error(message, {
                    stack: trace.parse(meta),
                });
            } else {
                this.processLogger.error(message, meta);
            }
        } else {
            this.processLogger.error(message);
        }
    }

    public warn(message: string, meta?: any) {
        if (meta != null) {
            this.processLogger.warn(message, meta);
        } else {
            this.processLogger.warn(message);
        }
    }

    public info(message: string, meta?: any) {
        if (meta != null) {
            this.processLogger.info(message, meta);
        } else {
            this.processLogger.info(message);
        }
    }

    public debug(message: string, meta?: any) {
        if (meta != null) {
            this.processLogger.debug(message, meta);
        } else {
            this.processLogger.debug(message);
        }
    }

    private init(opts: any): void {
        this.logFolder = path.join(__dirname, "..", "logs");
        Utils.createFolder(this.logFolder)
            .then(result => {
                if (result) {
                    this.info("Creating logs folder successful");
                } else {
                    this.warn("Creating logs folder failed");
                }
            })
            .catch(err => {
                this.error(err.message, err);
            });

        let processTransports: winston.TransportInstance[] = [];
        if (opts.console != null) {
            let consoleTrans = new winston.transports.Console(opts.console);
            processTransports.push(consoleTrans);
        }
        if (opts.file != null && opts.file.process != null) {
            let conf: any = opts.file.process;
            conf.filename = `${this.logFolder}${path.sep}${opts.file.process.name}`;
            let fileTrans = new winston.transports.File(conf);
            processTransports.push(fileTrans);
        }
        this.processLogger = new winston.Logger({
            transports: processTransports,
            exitOnError: opts.exitOnError != null ? opts.exitOnError : false,
        });

        let httpTransports: winston.TransportInstance[] = [];
        if (opts.console != null) {
            let consoleHttpTrans = new winston.transports.Console({
                level: "debug",
                handleExceptions: true,
                timestamp: true,
                json: false,
                colorize: true,
            });
            httpTransports.push(consoleHttpTrans);
        }
        if (opts.file != null && opts.file.transport != null) {
            let conf: any = opts.file.transport;
            conf.filename = `${this.logFolder}${path.sep}${opts.file.transport.name}`;
            let fileHttpTrans = new winston.transports.File(conf);
            httpTransports.push(fileHttpTrans);
        }
        this.httpLogger = new winston.Logger({
            transports: httpTransports,
            exitOnError: false,
        });
    }

}
export default new Logger(Conf.log);

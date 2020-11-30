import {Logger} from "./libs";
import {httpError, httpLogger} from "./middlewares/log";
import {notFound} from "./middlewares/not_found";
import {recovery} from "./middlewares/recovery";
import Router from "./routes/index";
import {json, urlencoded} from "body-parser";
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as helmet from "helmet";
import * as http from "http";
const path = require('path');

export class App {
    private app:express.Express;
    private bind:any;
    private server:http.Server;

    private static normalizePort(val:any) {
        let port = parseInt(val, 10);
        if (isNaN(port)) {
            return val;
        }
        if (port >= 0) {
            return port;
        }
        return false;
    }

    constructor() {
        this.app = express();
        this.app.set("x-powered-by", false);
        this.app.enable("trust proxy");
        this.app.disable("etag");

        //noinspection TypeScriptValidateTypes
        this.app.use(json({limit: '15mb', extended: true}))
        //noinspection TypeScriptValidateTypes
        this.app.use(urlencoded({limit: '15mb', extended: true, parameterLimit: 1000000}))
        //noinspection TypeScriptValidateTypes
        this.app.use(cookieParser());
        //noinspection TypeScriptValidateTypes
        this.app.use(helmet());
        //noinspection TypeScriptValidateTypes
        this.app.use(compression());

        this.app.all("/*", (req:express.Request, res:express.Response, next:express.NextFunction) => {
            // CORS headers
            res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
            res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
            // Set custom headers for CORS 
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Pragma, If-Modified-Since, Cache-Control, Authorization, action");
            res.header("Access-Control-Expose-Headers", "Total-Items, Item-Per-Page, Total, Offset, Limit");
            if (req.method === "OPTIONS") {
                res.status(200).end();
            } else {
                next();
            }
        });

        this.app.use("/public", express.static(path.join(__dirname, '../src/assets')));

        //noinspection TypeScriptValidateTypes
        this.app.use(httpLogger);

        //noinspection TypeScriptValidateTypes
        this.app.use("/", Router);

        //noinspection TypeScriptValidateTypes
        this.app.use(notFound);

        //noinspection TypeScriptValidateTypes
        this.app.use(httpError);

        // error handlers
        //noinspection TypeScriptValidateTypes
        this.app.use(recovery);

        this.server = http.createServer(this.app);
        // var listener = this.server.listen(this.bind,function(){
        //     console.log('Listening on port ' + listener.address().port);
        // });
        process.on("unhandledRejection", (reason:any) => {
            Logger.error("unhandledRejection: " + reason);
        });
        // process.on("uncaughtException", (err:Error) => {
        //     var listener = this.server.listen(this.bind,function(){
        //         console.log('Listening on port ' + listener.address().port);
        //     });
        //     Logger.error(err.message, err);
        // });

    }

    public listen(port:any) {
        if (process.env.PORT != null) {
            this.bind = App.normalizePort(process.env.PORT);
        } else if (port != null) {
            this.bind = App.normalizePort(port);
        } else {
            this.bind = 3000;
        }
        this.app.set("port", this.bind);
        this.server.on("error", this.onError.bind(this));
        this.server.on("listening", this.onListening.bind(this));
        this.server.listen(this.bind);
    }

    private onListening() {
        let addr = this.server.address();
        let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
        Logger.info("Listening on " + bind);
    }

    private onError(error:any) {
        if (error.syscall !== "listen") {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                Logger.error(this.bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                Logger.error(this.bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

export default new App();

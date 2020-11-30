
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as Knex from "knex";
import * as path from "path";
import {ConsoleTransportInstance} from "winston";
import {FileTransportInstance} from "winston";

export interface MailerOptions {
    email:string;
    direct:boolean;
    host:string;
    port:number;
    secure:boolean;
    auth:MailerAuthOption;
}

export interface MailerAuthOption {
    user:string;
    pass:string;
}

export interface DatabaseOption {
    mysql:string|Knex.ConnectionConfig|Knex.MariaSqlConnectionConfig|
        Knex.Sqlite3ConnectionConfig|Knex.SocketConnectionConfig;
}

export interface S3Option {
    path:string;
    region:string;
    acl:string;
    accessKeyId:string;
    secretAccessKey:string;
}

export interface StorageOption {
    awsBucketName:string;
    awsBucketPath:string;
    accelerateConfiguration:any;
    opts:any;
}

export interface  LogFileOption {
    process:FileTransportInstance;
    transport:FileTransportInstance;
}

export interface LogOption {
    exitOnError:boolean;
    console:ConsoleTransportInstance;
    file:LogFileOption;
}

export interface NexmoOption {
    apiKey:string;
    secretKey:string;
}

export class Config {
    public port:number;
    public mailer:MailerOptions;
    public database:DatabaseOption;
    public storage:StorageOption;
    public log:LogOption;
    public nexmo:NexmoOption;

    public static loadSetting():Config {
        let conf = new Config();
        let url = path.join(__dirname, "..", "configs");
        if (process.env.NODE_ENV == null) {
            process.env.NODE_ENV = "development";
        }
        try {
            let doc = yaml.safeLoad(fs.readFileSync(`${url}/${process.env.NODE_ENV}.yaml`, "utf8"));
            for (let key of Object.keys(doc)) {
                let val = doc[key];
                if (val != null) {
                    conf[key] = val;
                }
            }
        } catch (err) {
            //console.log(`Error when loading configuration file ${process.env.NODE_ENV}.yaml, fallback to configuration.yaml`);
            try {
                let doc = yaml.safeLoad(fs.readFileSync(`${url}/configuration.yaml`, "utf8"));
                for (let key of Object.keys(doc)) {
                    let val = doc[key];
                    if (val != null) {
                        conf[key] = val;
                    }
                }
            } catch (err) {
                //console.log(`Error when loading configuration file configuration.yaml, using default value for each module`);
            }
        }
        return conf;
    }
}

export default Config.loadSetting();

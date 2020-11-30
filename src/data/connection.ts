import Config from "../libs/config";
import Logger from "../libs/logger";
import * as Bookshelf from "bookshelf";
import * as Knex from "knex";

export class Connection {
    private static knex:Knex;
    private static instance:Bookshelf;

    public static bookshelf():Bookshelf {
        let defaultConf:any = {
            host: "127.0.0.1",
            port: 3306,
            user: "root",
            password: "Francis16732430@",
            database: "school_management",
            charset: "utf8mb4",
            timezone: "UTC",
        };
        let database:any = Config.database || {mysql: defaultConf};
        let mysql:any = database.mysql != null ? database.mysql : defaultConf;
        if (process.env.MYSQL_HOST != null) {
            mysql.host = process.env.MYSQL_HOST;
        }
        if (process.env.MYSQL_PORT != null) {
            mysql.port = process.env.PORT;
        }
        if (process.env.MYSQL_USER != null) {
            mysql.user = process.env.MYSQL_USER;
        }
        if (process.env.MYSQL_PASSWORD != null) {
            mysql.password = process.env.MYSQL_PASSWORD;
        }
        if (process.env.MYSQL_DB != null) {
            mysql.database = process.env.MYSQL_DB;
        }

        Connection.knex = Knex({
            client: "mysql",
            connection: mysql,
            debug: mysql.debug ? mysql.debug : true,
        });
        Connection.knex.raw("select 1 + 1 as result")
            .then(() => {
                Logger.info("Connected to database");
            })
            .catch(() => {
                Logger.error("Can't connect to database");
            });
        Connection.instance = Bookshelf(Connection.knex);
        Connection.instance.knex = Connection.knex;
        return Connection.instance;
    }
}

export default Connection.bookshelf();

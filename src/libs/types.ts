export class Types {
    private types: any = require("./types.json");

    constructor() {
        this.types = require("./types.json");
    }

    public getType(mime: string): string {
        let exts = this.types[mime];
        if (exts != null) {
            return exts[0];
        }

        return "";
    }
}

export default new Types();

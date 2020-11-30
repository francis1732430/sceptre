
import * as XLSX  from "xlsx";
import Logger from "./logger";

class Excel {
    constructor() {
    }

    /**
     *
     * @param filePath
     * @param sheetName
     * @returns {*}
     */
    parse(filePath) {
        try {
            let result = [];
            let workbook = XLSX.readFile(filePath);
            if (workbook.SheetNames) {
                let sheetName = workbook.SheetNames[0];
                let workSheet = workbook.Sheets[sheetName];
                result = XLSX.utils.sheet_to_json(workSheet);
            }
            return result;
        } catch (err) {
            Logger.error(err);
        }
    }
}
export default new Excel();

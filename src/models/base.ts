/**
 *    on 22/05/18.
 */
export class BaseModel {
    public rid:string;
    public status:number;
    public createdDate:string;
    public updatedDate:string;

    public static getString(val:any, defaultVal?:string):string {
        return val != null && val !== "" ? val : defaultVal;
    }

    public static getBoolean(val:any):boolean {
        if (val != null) {
            let bool = Boolean(val);
            return bool;
        }
        return false;
    }

    public static getNumber(val:any, defaultVal?:number):number {
        if (val != null) {
            let num = Number(val);
            return isNaN(val) ? defaultVal : num;
        } else {
            return defaultVal;
        }
    }
}

export default BaseModel;

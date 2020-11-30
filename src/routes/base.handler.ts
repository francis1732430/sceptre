export const languge = {
    CURRENT: "en",
    EN: {
        WEB:"English"
    },
    MY: {
        WEB:"Singapore"
    }
};



export class BaseHandler {

    constructor() {
    }

    public static setLang(lang:String):any {
        
        languge.CURRENT = String(lang);
    }
    
}
export default {BaseHandler,languge};
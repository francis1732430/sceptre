
import { PaidFeesDto } from "../data/models";
import {BaseUseCase} from "./base";

export class PaidFeesUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = PaidFeesDto;
    }
}
export default new PaidFeesUseCase();

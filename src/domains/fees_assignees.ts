
import { FeesAssigneeDto } from "../data/models";
import {BaseUseCase} from "./base";

export class FeesAssigneeUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = FeesAssigneeDto;
    }
}
export default new FeesAssigneeUseCase();

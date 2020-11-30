
import { FeesStandardDto } from "../data/models";
import {BaseUseCase} from "./base";

export class FeesStandardUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = FeesStandardDto;
    }
}
export default new FeesStandardUseCase();

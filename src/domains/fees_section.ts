
import { FeesSectionDto } from "../data/models";
import {BaseUseCase} from "./base";

export class FeesSectionUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = FeesSectionDto;
    }
}
export default new FeesSectionUseCase();

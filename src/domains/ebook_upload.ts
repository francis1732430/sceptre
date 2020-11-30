
import { EBookUploadDto } from "../data/models";
import {BaseUseCase} from "./base";

export class EbookUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = EBookUploadDto;
    }
}
export default new EbookUseCase();

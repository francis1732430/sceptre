
import { SyllabusLessonsDto } from "../data/models";
import {BaseUseCase} from "./base";

export class SyllabusLessonsUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = SyllabusLessonsDto;
    }
}
export default new SyllabusLessonsUseCase();

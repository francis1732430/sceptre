
import { ClassStudentsDto } from "../data/models";
import {BaseUseCase} from "./base";

export class ClassStudentsUseCase extends BaseUseCase {

    constructor() {
        super();
        this.mysqlModel = ClassStudentsDto;
    }
}
export default new ClassStudentsUseCase();

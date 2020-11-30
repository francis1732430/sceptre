import Mysql from "./connection";
import {
    AdminUserSessionTableSchema,
    AdminUserTableSchema,
    AuthorizationRoleTableSchema,
    RolesTableSchema,
    StandardTableSchema,
    SectionTableSchema,
    SubjectTableSchema,
    ClassTableSchema,
    SubjectAssigneesTableSchema,
    ClassStudentsTableSchema,
    HomeWorkTableSchema,
    MarkEvalutionTableSchema,
    ExamTypeTableSchema,
    ExamTableSchema,
    ExamEvalutionTableSchema,
    AttendanceTableSchema,
    FeesTypeTableSchema,
    FeesTableSchema,
    FeesAssigneesTableSchema,
    FeesStandardsTableSchema,
    FeesSectionsTableSchema,
    SyllabusTableSchema,
    LessonsTableSchema,
    SyllabusLessonsTableSchema,
    PaidFeesTableSchema,
    BusTableSchema,
    BusTrackingTableSchema,
    AssignedBusTableSchema,
    EbookTableSchema,
    EbookUploadTableSchema, 
} from "./schemas";
import * as Bookshelf from "bookshelf";
import * as UUID from "node-uuid";

export class BaseDto extends Mysql.Model<BaseDto>, Bookshelf.Model<BaseDto> {
    public static knex() {
        return Mysql.knex;
    }

    public static create(clazz:typeof BaseDto, value?:Object):Bookshelf.Model<any> {
        if (value != null) {
            //noinspection TypeScriptValidateTypes,TypeScriptUnresolvedFunction
            return new clazz().set(value);
        }
        //noinspection TypeScriptValidateTypes
        return new clazz();
    }

    private static generateUuid(model:any):void {
        if (model.isNew()) {
            model.set(model.idAttribute, UUID.v4());
        }
    }

    get idAttribute():string {
        return "rid";
    }

    get hasTimestamps():string[] {
        return ["created_date", "updated_date"];
    }

    public initialize():void {
        //noinspection TypeScriptUnresolvedFunction
        this.on("saving", BaseDto.generateUuid);
    }
}

export class AdminUserSessionDto extends BaseDto {
    get tableName() {
        return AdminUserSessionTableSchema.TABLE_NAME;
    }
}

export class AdminUserDto extends BaseDto {
    get tableName():string {
        return AdminUserTableSchema.TABLE_NAME;
    }
}

export class AuthorizationRoleDto extends BaseDto {
    get tableName():string {
        return AuthorizationRoleTableSchema.TABLE_NAME;
    }
}
export class RolesDto extends BaseDto {
    get tableName():string {
        return RolesTableSchema.TABLE_NAME;
    }
}
export class StandardDto extends BaseDto {
    get tableName():string {
        return StandardTableSchema.TABLE_NAME;
    }
}
export class SubjectDto extends BaseDto {
    get tableName():string {
        return SubjectTableSchema.TABLE_NAME;
    }
}
export class SectionDto extends BaseDto {
    get tableName():string {
        return SectionTableSchema.TABLE_NAME;
    }
}
export class ClassDto extends BaseDto {
    get tableName():string {
        return ClassTableSchema.TABLE_NAME;
    }
}
export class SubjectAssigneeDto extends BaseDto {
    get tableName():string {
        return SubjectAssigneesTableSchema.TABLE_NAME;
    }
}
export class ClassStudentsDto extends BaseDto {
    get tableName():string {
        return ClassStudentsTableSchema.TABLE_NAME;
    }
}
export class HomeWorkDto extends BaseDto {
    get tableName():string {
        return HomeWorkTableSchema.TABLE_NAME;
    }
}
export class MarkEvalutionDto extends BaseDto {
    get tableName():string {
        return MarkEvalutionTableSchema.TABLE_NAME;
    }
}
export class ExamTypeDto extends BaseDto {
    get tableName():string {
        return ExamTypeTableSchema.TABLE_NAME;
    }
}
export class ExamDto extends BaseDto {
    get tableName():string {
        return ExamTableSchema.TABLE_NAME;
    }
}
export class ExamEvalutionDto extends BaseDto {
    get tableName():string {
        return ExamEvalutionTableSchema.TABLE_NAME;
    }
}
export class AttendanceDto extends BaseDto {
    get tableName():string {
        return AttendanceTableSchema.TABLE_NAME;
    }
}
export class FeesTypeDto extends BaseDto {
    get tableName():string {
        return FeesTypeTableSchema.TABLE_NAME;
    }
}
export class FeesDto extends BaseDto {
    get tableName():string {
        return FeesTableSchema.TABLE_NAME;
    }
}
export class FeesAssigneeDto extends BaseDto {
    get tableName():string {
        return FeesAssigneesTableSchema.TABLE_NAME;
    }
}
export class FeesStandardDto extends BaseDto {
    get tableName():string {
        return FeesStandardsTableSchema.TABLE_NAME;
    }
}
export class FeesSectionDto extends BaseDto {
    get tableName():string {
        return FeesSectionsTableSchema.TABLE_NAME;
    }
}
export class SyllabusDto extends BaseDto {
    get tableName():string {
        return SyllabusTableSchema.TABLE_NAME;
    }
}
export class LessonsDto extends BaseDto {
    get tableName():string {
        return LessonsTableSchema.TABLE_NAME;
    }
}
export class SyllabusLessonsDto extends BaseDto {
    get tableName():string {
        return SyllabusLessonsTableSchema.TABLE_NAME;
    }
}
export class PaidFeesDto extends BaseDto {
    get tableName():string {
        return PaidFeesTableSchema.TABLE_NAME;
    }
}
export class BusDto extends BaseDto {
    get tableName():string {
        return BusTableSchema.TABLE_NAME;
    }
}
export class BusTrackingDto extends BaseDto {
    get tableName():string {
        return BusTrackingTableSchema.TABLE_NAME;
    }
}
export class BusAssignedDto extends BaseDto {
    get tableName():string {
        return AssignedBusTableSchema.TABLE_NAME;
    }
}
export class EBookDto extends BaseDto {
    get tableName():string {
        return EbookTableSchema.TABLE_NAME;
    }
}
export class EBookUploadDto extends BaseDto {
    get tableName():string {
        return EbookUploadTableSchema.TABLE_NAME;
    }
}

export const AdminUserTableSchema = {
    TABLE_NAME: "admin_user",
    FIELDS: {
        RID:"rid",
        USER_ID: "user_id",
        FIRSTNAME: "firstname",
        LASTNAME: "lastname",
        EMAIL: "email",
        PASSWORD: "password",
        CREATED_BY: "created_by",
        PHONE_NUMBER: "phone_number",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED: "is_deleted",
        IS_ACTIVE: "is_active",
        RP_TOKEN: "rp_token",
        IS_RESET_PASSWORD: "is_reset_password",
        ADDRESS: 'address',
        DOB: 'dob',
        EXP_YEAR: 'exp_year',
        EXP_MONTH: 'exp_month',
        IMAGE_URL: 'image_url',
    },
};
export const AdminUserSessionTableSchema = {
    TABLE_NAME: "admin_user_session",
    FIELDS: {
        RID:"rid",
        ID: "id",
        SESSION_ID: "session_id",
        USER_ID: "user_id",
        STATUS: "status",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IP: "ip",
        DEVICE_ID: "device_id",
        DEVICE_TOKEN: "device_token",
        PLATFORM: "platform",
    },
};

export const RolesTableSchema = {
    TABLE_NAME: "roles",
    FIELDS: {
        RID:"rid",
        ROLE_ID: "role_id",
        ROLE_NAME: "role_name",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED: "is_deleted",
        IS_ACTIVE: "is_active",
    },
};

export const AuthorizationRoleTableSchema = {
    TABLE_NAME: "authorization_role",
    FIELDS: {
        RID:"rid",
        RULE_ID: "rule_id",
        USER_ID: "user_id",
        ROLE_ID: "role_id",
        PERMISSION: "permission",
        IS_DELETED: "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
    },
};  

export const DirectoryCountryTableSchema = {
    TABLE_NAME: "directory_country",
    FIELDS: {
        COUNTRY_ID: "country_id",
        ISO2_CODE: "iso2_code",
        ISO3_CODE: "iso3_code",
        COUNTRY_NAME: "country_name",
        RID:"rid",
        ENTITY_ID:"entity_id",
        IS_ACTIVE: "is_active",
        IS_DELETED : "is_deleted",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
    },
};

export const DirectoryStateTableSchema = {
    TABLE_NAME: "directory_state",
    FIELDS: {
        RID:"rid",
        STATE_ID:"state_id",
        STATE_NAME: "state_name",
        COUNTRY_ID: "country_id",
        IS_ACTIVE: "is_active",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted"
    },
};

export const DirectoryCityTableSchema = {
    TABLE_NAME: "directory_city",
    FIELDS: {
        RID:"rid",
        CITY_ID:"city_id",
        CITY_NAME: "city_name",
        STATE_ID: "state_id",
        IS_ACTIVE: "is_active",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted"
    },
};
export const StandardTableSchema = {
    TABLE_NAME: "standard",
    FIELDS: {
        RID:"rid",
        STANDARD_ID:"standard_id",
        STANDARD_NAME: "standard_name",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted"
    },
};
export const SectionTableSchema = {
    TABLE_NAME: "section",
    FIELDS: {
        RID:"rid",
        SECTION_ID:"section_id",
        SECTION_NAME: "section_name",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted"
    },
};
export const SubjectTableSchema = {
    TABLE_NAME: "subject",
    FIELDS: {
        RID:"rid",
        SUBJECT_ID:"subject_id",
        SUBJECT_NAME: "subject_name",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted"
    },
};
export const SubjectAssigneesTableSchema = {
    TABLE_NAME: "subject_assignees",
    FIELDS: {
        RID:"rid",
        ID:"id",
        SUBJECT_ID: "subject_id",
        ASSIGNEE_ID: "assignee_id",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted"
    },
};
export const ClassTableSchema = {
    TABLE_NAME: "class",
    FIELDS: {
        RID:"rid",
        CLASS_ID:"class_id",
        CLASS_NAME: "class_name",
        SUBJECT_ASSIGNEE_IDs: "subject_assignee_ids",
        STANDARD_ID: "standard_id",
        SECTION_ID: "section_id",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
        CREATED_BY_ID: 'created_by_id'
    },
};
export const ClassStudentsTableSchema = {
    TABLE_NAME: "class_students",
    FIELDS: {
        RID:"rid",
        ID:"id",
        USER_ID: "user_id",
        CLASS_ID: "class_id",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const HomeWorkTableSchema = {
    TABLE_NAME: "home_work",
    FIELDS: {
        RID:"rid",
        ID:"id",
        HOME_WORK_DATE: "home_work_date",
        SUBMISSION_DATE: "submission_date",
        STANDARD_ID: "standard_id",
        SECTION_ID: "section_id",
        SUBJECT_ID: "subject_id",
        MARKS: "marks",
        DESCRIPTION: "description",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
        CREATED_BY: "created_by",
        EVALUTION_DATE: "evalution_date",
    },
};
export const MarkEvalutionTableSchema = {
    TABLE_NAME: "mark_evalution",
    FIELDS: {
        RID:"rid",
        EVALUTION_ID:"evalution_id",
        STUDENT_ID: "student_id",
        HOME_WORK_ID: "home_work_id",
        MARKS: "marks",
        COMMENTS: "comments",
        HOME_WORK_STATUS: "home_work_status",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
        CREATED_BY: "created_by",
    },
};
export const ExamTypeTableSchema = {
    TABLE_NAME: "exam_type",
    FIELDS: {
        RID:"rid",
        ID:"id",
        EXAM_TYPE: "exam_type",
        IS_ACTIVE: "is_active",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const ExamTableSchema = {
    TABLE_NAME: "exam",
    FIELDS: {
        RID:"rid",
        EXAM_ID:"exam_id",
        STANDARD_ID: "standard_id",
        SECTION_ID: "section_id",
        EXAM_TYPE: "exam_type",
        SUBJECTS: "subjects",
        TOTAL_MARK: "total_mark",
        EXAM_START_DATE: "exam_start_date",
        EXAM_END_DATE: "exam_end_date",
        EXAM_START_TIME: "exam_start_time",
        EXAM_DATE: "exam_date",
        ONLINE_EXAM: "online_exam",
        IS_ACTIVE: "is_active",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const ExamEvalutionTableSchema = {
    TABLE_NAME: "exam_evalution",
    FIELDS: {
        RID:"rid",
        ID:"id",
        STUDENT_ID: "student_id",
        EXAM_ID: "exam_id",
        SUBJECT_ID: "subject_id",
        MARKS: "marks",
        COMMENTS: "comments",
        EXAM_STATUS: "exam_status",
        EXAM_DATE: "exam_date",
        EXAM_PAPER_NAME: "file_name",
        IS_ACTIVE: "is_active",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const AttendanceTableSchema = {
    TABLE_NAME: "attendance",
    FIELDS: {
        RID:"rid",
        ID:"id",
        STANDARD_ID: "standard_id",
        SECTION_ID: "section_id",
        STUDENT_ID: "student_id",
        FORENOON: "forenoon",
        AFTERNOON: "afternoon",
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
        ATTENDANCE_DATE: "attendance_date"
    },
};
export const FeesTypeTableSchema = {
    TABLE_NAME: "fees_type",
    FIELDS: {
        RID:"rid",
        ID:"id",
        FEES_TYPE: 'fees_type',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const FeesTableSchema = {
    TABLE_NAME: "fees",
    FIELDS: {
        RID:"rid",
        ID:"id",
        FEES_TYPE_ID: 'fees_type_id',
        FEES_AMOUNT: 'fees_amount',
        FEES_OPTION: 'fees_option',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const FeesAssigneesTableSchema = {
    TABLE_NAME: "fees_assignee_ids",
    FIELDS: {
        RID:"rid",
        ID:"id",
        STUDENT_ID: 'student_id',
        FEES_ID: 'fees_id',
        STANDARD_ID: 'standard_id',
        SECTION_ID: 'section_id',
        STANDARD_NAME: 'standard_name',
        SECTION_NAME: 'section_name',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const FeesStandardsTableSchema = {
    TABLE_NAME: "fees_standards",
    FIELDS: {
        RID:"rid",
        ID:"id",
        STANDARD_ID: 'standard_id',
        FEES_ID: 'fees_id',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const FeesSectionsTableSchema = {
    TABLE_NAME: "fees_sections",
    FIELDS: {
        RID:"rid",
        ID:"id",
        STANDARD_ID: 'standard_id',
        SECTION_ID: 'section_id',
        FEES_ID: 'fees_id',
        STANDARD_NAME: 'standard_name',
        SECTION_NAME: 'section_name',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const SyllabusTableSchema = {
    TABLE_NAME: "syllabus",
    FIELDS: {
        RID:"rid",
        ID:"id",
        CLASS_ID: 'class_id',
        SUBJECT_ID: 'subject_id',
        LESSON_STATUS: 'lesson_status',
        STANDARD_NAME: 'standard_name',
        TEACHER_ID: 'teacher_id',
        STANDARD_ID: 'standard_id',
        SECTION_ID: 'section_id',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const LessonsTableSchema = {
    TABLE_NAME: "lessons",
    FIELDS: {
        RID:"rid",
        ID:"id",
        LESSON_NAME: 'lesson_name',
        STANDARD_ID: 'standard_id',
        SUBJECT_ID: 'subject_id',
        STATUS: 'status',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const SyllabusLessonsTableSchema = {
    TABLE_NAME: "syllabus_lessons",
    FIELDS: {
        RID:"rid",
        ID:"id",
        SYLLABUS_ID: 'syllabus_id',
        LESSON_ID: 'lesson_id',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const PaidFeesTableSchema = {
    TABLE_NAME: "paid_fees",
    FIELDS: {
        RID:"rid",
        ID:"id",
        FEES_ID: 'fees_id',
        STANDARD_ID: 'standard_id',
        SECTION_ID: 'section_id',
        STUDENT_ID: 'student_id',
        FEES_AMOUNT: 'fees_amount',
        PAID_STATUS: 'paid_status',
        TRANSACTION_ID: 'transaction_id',
        CREATED_BY: 'created_by',
        PAYMENT_MODE: 'payment_mode',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
export const BusTableSchema = {
    TABLE_NAME: "bus",
    FIELDS: {
        RID:"rid",
        ID:"id",
        BUS_NAME: 'bus_name',
        BUS_NUMBER: 'bus_number',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};

export const AssignedBusTableSchema = {
    TABLE_NAME: "assigned_busses",
    FIELDS: {
        RID:"rid",
        ID:"id",
        BUS_ID: 'bus_id',
        DRIVER_ID: 'driver_id',
        IS_ACTIVE: 'is_active',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};

export const BusTrackingTableSchema = {
    TABLE_NAME: "bus_tracking",
    FIELDS: {
        RID:"rid",
        ID:"id",
        BUS_ID: 'bus_id',
        LAT: 'lat',
        LANG: 'lang',
        IS_ACTIVE: 'is_active',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};

export const EbookTableSchema = {
    TABLE_NAME: "ebooks",
    FIELDS: {
        RID:"rid",
        ID:"id",
        STANDARD_ID: 'standard_id',
        SUBJECT_ID: 'subject_id',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};

export const EbookUploadTableSchema = {
    TABLE_NAME: "ebook_upload",
    FIELDS: {
        RID:"rid",
        ID:"id",
        NAME: 'name',
        EBOOK_URL: 'ebook_url',
        EBOOK_ID: 'ebook_id',
        CREATED_DATE: "created_date",
        UPDATED_DATE: "updated_date",
        IS_DELETED : "is_deleted",
    },
};
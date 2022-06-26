import { ValidatorChecker } from "./ValidatorChecker";

export type Validator = IntValidator | FloatValidator | StrintValidator |
    StringValidator | EmailValidator | BoolValidator | NullValidator | AnyValidator |
    BufferValidator | ConstValidator | EnumValidator | ListValidator | MapValidator |
    ObjectValidator | OneOfValidator | CustomValidator;

export interface BaseValidator {
    nullable?: boolean;
    errorName?: string;
}

export interface IntValidator extends BaseValidator, MinMaxValidator {
    type: "int";
}

export interface FloatValidator extends BaseValidator, MinMaxValidator {
    type: "float";
}

export interface StrintValidator extends BaseValidator, MinMaxValidator {
    type: "strint";
}

export interface StringValidator extends BaseValidator, WithLengthValidator {
    type: "string";
}

export interface EmailValidator extends BaseValidator, WithLengthValidator {
    type: "email";
}

export interface BufferValidator extends BaseValidator, WithLengthValidator {
    type: "buffer";
}

export interface BoolValidator extends BaseValidator {
    type: "bool";
}

export interface NullValidator extends BaseValidator {
    type: "null";
}

export interface AnyValidator extends BaseValidator {
    type: "any";
}

export interface ConstValidator extends BaseValidator {
    type: "const";
    value: unknown;
}

export interface EnumValidator extends BaseValidator {
    type: "enum";
    values: unknown[];
}

export interface ListValidator extends BaseValidator, WithLengthValidator {
    type: "list";
    spec: Validator;
}

export type MapIntegrationValidator = (key: unknown, value: unknown) => unknown;

export interface MapValidator extends BaseValidator, WithLengthValidator {
    type: "map";
    keySpec: Validator;
    valSpec: Validator;
    integrationSpec?: MapIntegrationValidator;
}

export interface ObjectValidator extends BaseValidator {
    type: "object";
    spec: ObjectValidatorSpec;
}

export type ObjectValidatorSpec = {[key: string]: Validator&{required?: boolean}};

export interface OneOfValidator extends BaseValidator {
    type: "oneOf";
    specs: Validator[];
    indicator?: string;
}

export interface MinMaxValidator {
    min?: number;
    max?: number;
}

export interface WithLengthValidator {
    length?: number;
    minLength?: number;
    maxLength?: number;
}

export type CustomValidatorFunc = (value: unknown, validator: Validator, checker: ValidatorChecker) => void;

export interface CustomValidator extends BaseValidator {
    type: "custom";
    func: CustomValidatorFunc;
}

export interface PerNameValidator {
    
    validate(name: string, data: unknown): void;
}

export interface ErrorWithMessage {
    message: string;
}

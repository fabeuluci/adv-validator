import { Validator, MapIntegrationValidator, ObjectValidatorSpec, CustomValidator, MapValidator, OneOfValidator, WithLengthValidator, ListValidator, ObjectValidator, ConstValidator, MinMaxValidator, EnumValidator, CustomValidatorFunc, StringValidator, BaseValidator, BufferValidator, EmailValidator, IntValidator, FloatValidator, BoolValidator, StrintValidator, NullValidator, AnyValidator } from "./Types";

export class ValidatorBuilder {
    
    int: IntValidator;
    float: FloatValidator;
    string: StringValidator;
    bool: BoolValidator;
    email: EmailValidator;
    strint: StrintValidator;
    buffer: BufferValidator;
    empty: ObjectValidator;
    nullValue: NullValidator;
    any: AnyValidator;
    false: ConstValidator;
    true: ConstValidator;
    
    constructor() {
        this.int = {type: "int"};
        this.string = {type: "string"};
        this.float = {type: "float"};
        this.bool = {type: "bool"};
        this.email = {type: "email"};
        this.strint = {type: "strint"};
        this.buffer = {type: "buffer"};
        this.empty = this.createObject({});
        this.nullValue = {type: "null"};
        this.any = {type: "any"};
        this.false = this.createConst(false);
        this.true = this.createConst(true);
    }
    
    createConst(value: unknown): ConstValidator {
        return {type: "const", value: value};
    }
    
    createEnum(values: unknown[]): EnumValidator {
        return {type: "enum", values: values};
    }
    
    createEnumFromObj(enumObj: {[key: string]: unknown}): EnumValidator {
        return this.createEnum(Object.values(enumObj));
    }
    
    createList(spec: Validator): ListValidator {
        return {type: "list", spec: spec};
    }
    
    createListWithLength(spec: Validator, length: number): ListValidator {
        return {type: "list", spec: spec, length: length};
    }
    
    createListWithMinLength(spec: Validator, minLength: number): ListValidator {
        return {type: "list", spec: spec, minLength: minLength};
    }
    
    createListWithMaxLength(spec: Validator, maxLength: number): ListValidator {
        return {type: "list", spec: spec, maxLength: maxLength};
    }
    
    createListWithRangeLength(spec: Validator, minLength: number, maxLength: number): ListValidator {
        return {type: "list", spec: spec, minLength: minLength, maxLength: maxLength};
    }
    
    createMap(keySpec: Validator, valSpec: Validator, integrationSpec?: MapIntegrationValidator): MapValidator {
        return {type: "map", keySpec: keySpec, valSpec: valSpec, integrationSpec: integrationSpec};
    }
    
    createObject(spec: ObjectValidatorSpec): ObjectValidator {
        return {type: "object", spec: spec};
    }
    
    createOneOf(specs: Validator[], indicator?: string): OneOfValidator {
        return {type: "oneOf", specs: specs, indicator: indicator};
    }
    
    createOrFalse(spec: Validator): OneOfValidator {
        return this.createOneOf([spec, this.false]);
    }
    
    createCustom(func: CustomValidatorFunc): CustomValidator {
        return {type: "custom", func: func};
    }
    
    error(validator: Validator, errorName: string): Validator {
        return {
            ...validator,
            errorName: errorName
        };
    }
    
    min<T extends MinMaxValidator>(validator: T, min: number): T {
        return {
            ...validator,
            min: min
        };
    }
    
    max<T extends MinMaxValidator>(validator: T, max: number): T {
        return {
            ...validator,
            max: max
        };
    }
    
    range<T extends MinMaxValidator>(validator: T, min: number, max: number): T {
        return {
            ...validator,
            min: min,
            max: max
        };
    }
    
    length<T extends WithLengthValidator>(validator: T, length: number): T {
        return {
            ...validator,
            length: length
        };
    }
    
    minLength<T extends WithLengthValidator>(validator: T, minLength: number): T {
        return {
            ...validator,
            minLength: minLength
        };
    }
    
    maxLength<T extends WithLengthValidator>(validator: T, maxLength: number): T {
        return {
            ...validator,
            maxLength: maxLength
        };
    }
    
    rangeLength<T extends WithLengthValidator>(validator: T, minLength: number, maxLength: number): T {
        return {
            ...validator,
            minLength: minLength,
            maxLength: maxLength
        };
    }
    
    addFields(validator: ObjectValidator, fields: ObjectValidatorSpec): ObjectValidator {
        return {
            ...validator,
            spec: {
                ...validator.spec,
                ...fields
            }
        };
    }
    
    optional<T extends Validator>(validator: T): T&{required: boolean} {
        return {
            ...validator,
            required: false
        };
    }
    
    nullable<T extends BaseValidator>(validator: T): T {
        return {
            ...validator,
            nullable: true
        };
    }
    
    nullableOptional<T extends BaseValidator>(validator: T): T&{required: boolean} {
        return {
            ...validator,
            nullable: true,
            required: false
        };
    }
    
    maybeEmptyString(validator: Validator) {
        const v = this.createOneOf([validator, this.length(this.string, 0)]);
        if (validator.errorName) {
            v.errorName = validator.errorName;
        }
        return v;
    }
    
    extends<T extends Validator>(validator: T, fields: {[key: string]: unknown}): T {
        return {
            ...validator,
            ...fields
        };
    }
}

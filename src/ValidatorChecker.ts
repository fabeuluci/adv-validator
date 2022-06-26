import { Validator, MapIntegrationValidator, ObjectValidatorSpec, WithLengthValidator, MinMaxValidator } from "./Types";
import { ValidatorException  } from "./ValidatorException";

export class ValidatorChecker {
    
    static isEmailValid(value: string) {
        const email = value.trim().split("@");
        return email.length == 2 && email[0].length > 0 && email[1].length > 0;
    }
    
    static isNotNullObject(obj: unknown): obj is {[key: string]: unknown} {
        return typeof(obj) == "object" && obj != null;
    }
    
    validateLength(length: number, validator: WithLengthValidator): void {
        if (validator.minLength != null && length < validator.minLength) {
            throw new Error("Invalid length! Expected min " + validator.minLength + ", get " + length);
        }
        if (validator.maxLength != null && length > validator.maxLength) {
            throw new Error("Invalid length! Expected max " + validator.maxLength + ", get " + length);
        }
        if (validator.length != null && length != validator.length) {
            throw new Error("Invalid length! Expected exactly " + validator.length + ", get " + length);
        }
    }
    
    validateNumberRange(value: number, validator: MinMaxValidator): void {
        if (validator.min != null && value < validator.min) {
            throw new Error("Invalid range! Expected min " + validator.min + ", get " + value);
        }
        if (validator.max != null && value > validator.max) {
            throw new Error("Invalid range! Expected max " + validator.max + ", get " + value);
        }
    }
    
    validateValue(value: unknown, validator: Validator): void {
        try {
            this.validateValueMain(value, validator);
        }
        catch (e) {
            throw ValidatorException.create(value, validator, e);
        }
    }
    
    validateValueMain(value: unknown, validator: Validator): void {
        if (validator.nullable === true && value === null) {
            return;
        }
        else if (validator.type == "any") {
            return;
        }
        else if (validator.type == "string") {
            if (typeof(value) != "string") {
                throw new Error("Expected string");
            }
            this.validateLength(value.length, validator);
        }
        else if (validator.type == "email") {
            if (typeof(value) != "string") {
                throw new Error("Expected string");
            }
            this.validateLength(value.length, validator);
            if (!ValidatorChecker.isEmailValid(value)) {
                throw new Error("Expected email");
            }
        }
        else if (validator.type == "buffer") {
            if (!(value instanceof Uint8Array)) {
                throw new Error("Expected Uint8Array");
            }
            this.validateLength(value.length, validator);
        }
        else if (validator.type == "null") {
            if (value !== null) {
                throw new Error("Expected null");
            }
        }
        else if (validator.type == "bool") {
            if (typeof(value) != "boolean") {
                throw new Error("Expected bool");
            }
        }
        else if (validator.type == "strint") {
            if (typeof(value) != "string") {
                throw new Error("Expected string");
            }
            const intValue = parseInt(value, 10);
            if (isNaN(intValue)) {
                throw new Error("Expected integer");
            }
            this.validateNumberRange(intValue, validator);
        }
        else if (validator.type == "int") {
            if (typeof(value) != "number" || value % 1 != 0) {
                throw new Error("Expected integer");
            }
            this.validateNumberRange(value, validator);
        }
        else if (validator.type == "float") {
            if (typeof(value) != "number") {
                throw new Error("Expected float");
            }
            this.validateNumberRange(value, validator);
        }
        else if (validator.type == "enum") {
            if (validator.values.indexOf(value) == -1) {
                throw new Error("Expected value to be one of enums");
            }
        }
        else if (validator.type == "const") {
            if (validator.value !== value) {
                throw new Error("Expected value to be exactly " + validator.value);
            }
        }
        else if (validator.type == "list") {
            if (!Array.isArray(value)) {
                throw new Error("Expected list");
            }
            this.validateLength(value.length, validator);
            this.validateArray(value, validator.spec);
        }
        else if (validator.type == "object") {
            if (!ValidatorChecker.isNotNullObject(value)) {
                throw new Error("Expected object");
            }
            this.validateObject(value, validator.spec);
        }
        else if (validator.type == "oneOf") {
            this.validateOneOf(value, validator.specs, validator.indicator);
        }
        else if (validator.type == "map") {
            if (!ValidatorChecker.isNotNullObject(value)) {
                throw new Error("Expected object");
            }
            this.validateLength(Object.keys(value).length, validator);
            this.validateMap(value, validator.keySpec, validator.valSpec, validator.integrationSpec);
        }
        else if (validator.type == "custom") {
            validator.func(value, validator, this);
        }
        else {
            throw new Error("Invalid validator type " + (<Validator>validator).type);
        }
    }
    
    validateArray(list: unknown[], validator: Validator): void {
        for (const [i, v] of list.entries()) {
            try {
                this.validateValue(v, validator);
            }
            catch (e) {
                throw ValidatorException.createProxy(i.toString(), e);
            }
        }
    }
    
    validateObject(object: {[key: string]: unknown}, validator: ObjectValidatorSpec): void {
        for (const key in validator) {
            if (!(key in object) && validator[key].required !== false) {
                throw new Error("Key '" + key + "' is required");
            }
        }
        for (const key in object) {
            if (!(key in validator)) {
                throw new Error("Unexpected key '" + key + "'");
            }
            try {
                this.validateValue(object[key], validator[key]);
            }
            catch (e) {
                throw ValidatorException.createProxy(key, e);
            }
        }
    }
    
    validateOneOf(value: unknown, validators: Validator[], indicator?: string): void {
        for (const validator of validators) {
            try {
                this.validateValue(value, validator);
                return;
            }
            catch (e) {
                // Do nothing just go to next spec
            }
        }
        if (indicator && ValidatorChecker.isNotNullObject(value)) {
            const indicatorValue = value[indicator];
            const validator = validators.find(x => {
                if (x.type != "object") {
                    return false;
                }
                const spec = x.spec[indicator];
                return spec && spec.type == "const" && spec.value == indicatorValue;
            });
            if (validator) {
                this.validateValue(value, validator);
                return;
            }
        }
        throw new Error("Value doesn't match any spec");
    }
    
    validateMap(map: {[key: string]: unknown}, keySpec: Validator, valSpec: Validator, integrationSpec?: MapIntegrationValidator): void {
        for (const key in map) {
            try {
                this.validateValue(key, keySpec);
            }
            catch (e) {
                throw ValidatorException.createProxy(key + "(key)", e);
            }
            try {
                this.validateValue(map[key], valSpec);
            }
            catch (e) {
                throw ValidatorException.createProxy(key + "(value)", e);
            }
            if (integrationSpec) {
                if (integrationSpec(key, map[key]) === false) {
                    throw new Error("Map key doesn't match to entry");
                }
            }
        }
    }
}

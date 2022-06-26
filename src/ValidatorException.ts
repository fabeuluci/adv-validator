import { ErrorWithMessage, Validator } from "./Types";

export class ValidatorException {
    
    constructor(public value: unknown, public validator: Validator|null, public message: string|undefined, public cause: unknown) {
    }
    
    static create(value: unknown, validator: Validator, cause: unknown) {
        return new ValidatorException(value, validator, ValidatorException.getMessageFromError(cause), cause);
    }
    
    static createProxy(message: string, cause: unknown) {
        return new ValidatorException(null, null, message + " -> " + ValidatorException.getMessageFromError(cause) || "<unknown>", cause);
    }
    
    static isErrorWithMessage(e: unknown): e is ErrorWithMessage {
        return typeof(e) == "object" && e != null && typeof((<ErrorWithMessage>e).message) == "string";
    }
    
    static getMessageFromError(e: unknown): string|undefined {
        return ValidatorException.isErrorWithMessage(e) ? e.message : undefined;
    }
    
    getErrorName(): string {
        if (this.validator != null && this.validator.errorName != null) {
            return this.validator.errorName;
        }
        if (this.cause instanceof ValidatorException) {
            return this.cause.getErrorName();
        }
        return "INVALID_PARAMS";
    }
    
    static getErrorNameFromException(e: unknown): string {
        if (e instanceof ValidatorException) {
            return e.getErrorName();
        }
        return "INVALID_PARAMS";
    }
}

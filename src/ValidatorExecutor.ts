import { ValidatorChecker } from "./ValidatorChecker";
import { Validator } from "./Types";

export class ValidatorExecutor {
    
    private static DEFAULT_CHECKER = new ValidatorChecker();
    private checker: ValidatorChecker;
    
    constructor(private validator: Validator, checker?: ValidatorChecker) {
        this.checker = checker || ValidatorExecutor.DEFAULT_CHECKER;
    }
    
    validate(value: unknown): void {
        this.checker.validateValue(value, this.validator);
    }
    
    isValid(value: unknown): boolean {
        try {
            this.validate(value);
            return true;
        }
        catch (_) {
            return false;
        }
    }
}

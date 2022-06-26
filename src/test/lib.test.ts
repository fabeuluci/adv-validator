import * as assert from "assert";
import { ValidatorBuilder } from "../ValidatorBuilder";
import { ValidatorException } from "../ValidatorException";
import { ValidatorExecutor } from "../ValidatorExecutor";
import "q2-test";

it("Should validation successfully ends", () => {
    const builder = new ValidatorBuilder();
    const validator = builder.createObject({
        a: builder.string,
        b: builder.int
    });
    const executor = new ValidatorExecutor(validator);
    try {
        executor.validate({a: "a", b: 123});
        assert(true);
    }
    catch (e) {
        console.log("Exception", e);
        assert(false, "Not expected exception");
    }
});

it("Should validation ends with error", () => {
    const builder = new ValidatorBuilder();
    const validator = builder.createObject({
        a: builder.string,
        b: builder.int
    });
    const executor = new ValidatorExecutor(validator);
    try {
        executor.validate({a: 1, b: "a"});
        assert(false, "Not expected valid value");
    }
    catch (e) {
        assert(e instanceof ValidatorException);
        assert(e.message === "a -> Expected string");
    }
});
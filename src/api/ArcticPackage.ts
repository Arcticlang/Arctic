import Environment from "../interpreter/Environment";
import Interpreter from "../interpreter/Interpreter";
import { Callable } from "../interpreter/values/Callable";
import ArcticClass from "./ArcticClass";
import ArcticVariable from "./ArcticVariable";

export type ArcticType = | ArcticVariable | Callable | ArcticClass;

export default class ArcticPackage {
    readonly environment: Environment;

    constructor() {
        this.environment = new Environment(Interpreter.interpreter.globals);
    }

}
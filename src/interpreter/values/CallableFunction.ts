import Environment from "../Environment";
import Interpreter from "../Interpreter";
import { Callable } from "./Callable";
import Instance from "./Instance";
import util from 'util';

export default abstract class CallableFunction implements Callable {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    abstract bind(instance: Instance): CallableFunction;
    abstract arity: number;
    abstract call(interpreter: Interpreter, args: any[]): any;

    [util.inspect.custom]() {
		return `<function ${this.name}>`;
	}

}
import Interpreter from '../interpreter/Interpreter';
import { Callable } from '../interpreter/values/Callable';
import CallableFunction from '../interpreter/values/CallableFunction';
import Instance from '../interpreter/values/Instance';

export default class ArcticFunction extends CallableFunction {
    private method: Callable;

    constructor(name: string, method: Callable) {
        super(name);
        this.method = method;
    }

    bind(instance: Instance): CallableFunction {
        return this;
    }

    get arity() {
        return this.method.arity;
    }

    call(interpreter: Interpreter, args: any[]) {
		return this.method.call(interpreter, args);
    }

}
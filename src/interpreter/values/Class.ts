import { Callable } from './Callable';
import util from 'util';
import Interpreter from '../Interpreter';
import CallableFunction from './CallableFunction';
import Instance from './Instance';

export default class Class implements Callable {
    readonly name: string;
    private readonly methods: Map<string, CallableFunction>;
    readonly properties: Map<string, any>;

    constructor(name: string, methods: Map<string, CallableFunction>, properties: Map<string, any>) {
        this.name = name;
        this.methods = methods;
        this.properties = properties;
    }

    findMethod(name: string): CallableFunction {
        if(this.methods.has(name)) {
            return this.methods.get(name)!;
        }

        return null!;
    }

    findProperty(name: string): any {
        if(this.properties.has(name)) {
            return this.properties.get(name)!;
        }

        return null;
    }

    set(name: string, value: any) {
        this.properties.set(name, value);
    }

    setMethod(method: CallableFunction) {
        this.methods.set(method.name, method);
    }

    createInstance(args: any[]): Instance {
        let instance = new Instance(this);
        let initializer = this.findMethod(this.name);
        if(initializer != null) {
            initializer.bind(instance).call(Interpreter.interpreter, args);
        }

        return instance;
    }

    get arity() {
        let initializer = this.findMethod(this.name);
        if(initializer == null) return 0;
        return initializer.arity;
    }

    call(interpreter: Interpreter, args: any[]) {
        let instance = new Instance(this);
        let initializer = this.findMethod(this.name);
        if(initializer != null) {
            initializer.bind(instance).call(interpreter, args);
        }

        return instance;
    }

    [util.inspect.custom]() {
        return this.name;
    }

}
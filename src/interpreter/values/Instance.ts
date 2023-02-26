import util from 'util';
import Token from "../../lexer/Token";
import RuntimeError from "../../errors/RuntimeError";
import { Callable } from "./Callable";
import Class from './Class';

export default class Instance {
    fields: Map<string, any> = new Map();
    methods: Map<string, Callable> = new Map();

    readonly klass: Class;

    constructor(klass: Class) {
        this.klass = klass;
        this.fields = this.klass.properties;
    }

    get(name: Token) {
        if(this.fields.has(name.value)) {
            return this.fields.get(name.value);
        }

        let method = this.klass.findMethod(name.value);
        if(method != null) return method.bind(this);

        throw new RuntimeError(`Undefined property '${name.value}'.`, name.posStart, name.posEnd);
    }

    set(name: string, value: any) {
        this.fields.set(name, value);
    }

    toString() {
        return this.klass.name + " instance";
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}
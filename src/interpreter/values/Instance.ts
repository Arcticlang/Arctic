import Class from "./Class";
import util from 'util';
import Token from "../../lexer/Token";
import RuntimeError from "../../errors/RuntimeError";

export default class Instance {
    readonly klass: Class;
    private fields: Map<string, any> = new Map();

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

        let property = this.klass.findProperty(name.value);
        if(property != null) return property;

        throw new RuntimeError(`Undefined property '${name.value}'.`, name.posStart, name.posEnd);
    }

    set(name: Token, value: any) {
        this.fields.set(name.value, value);
    }

    toString() {
        return this.klass.name + " instance";
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}
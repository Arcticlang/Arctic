import RuntimeError from "../../errors/RuntimeError";
import Token from "../../lexer/Token";
import CallableFunction from "./CallableFunction";
import Class from "./Class";

export default class Namespace {
    readonly name: string;
    
    classes: Map<string, Class>;
    methods: Map<string, CallableFunction>;
    properties: Map<string, any>;

    constructor(name: string, classes: Map<string, Class>, methods: Map<string, CallableFunction>, properties: Map<string, any>) {
        this.name = name;
        this.classes = classes;
        this.methods = methods;
        this.properties = properties;
    }

    get(name: Token) {
        let property = this.findProperty(name.value);
        if(property != null) return property;

        let method = this.findMethod(name.value);
        if(method != null) return method;

        let klass = this.findClass(name.value);
        if(klass != null) return klass;

        throw new RuntimeError(`Undefined property '${name.value}'.`, name.posStart, name.posEnd);
    }

    findMethod(name: string) {
        if(this.methods.has(name)) {
            return this.methods.get(name)!;
        }

        return null;
    }

    findClass(name: string) {
        if(this.classes.has(name)) {
            return this.classes.get(name)!;
        }

        return null;
    }

    findProperty(name: string) {
        if(this.properties.has(name)) {
            return this.properties.get(name)!;
        }

        return null;
    }

}
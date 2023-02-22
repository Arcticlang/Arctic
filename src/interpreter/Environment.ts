import RuntimeError from "../errors/RuntimeError";
import Token from "../lexer/Token";

export default class Environment {
    readonly enclosing: Environment;
    readonly values: Map<string, any> = new Map();

    constructor(enclosing: Environment=null!) {
        this.enclosing = enclosing;
    }

    get(name: Token): any {
        if(this.values.has(name.value)) {
            return this.values.get(name.value)!;
        }

        if(this.enclosing != null) return this.enclosing.get(name);

        throw new RuntimeError(`Undefined variable '${name.value}'.`, name.posStart, name.posEnd);
    }

    assign(name: Token, value: any) {
        if(this.values.has(name.value)) {
            this.values.set(name.value, value);
            return;
        }

        if(this.enclosing != null) {
            this.enclosing.assign(name, value);
            return;
        }

        throw new RuntimeError(`Undefined variable '${name.value}'.`, name.posStart, name.posEnd);
    }

    define(name: string, value: any) {
        this.values.set(name, value);
    }

    ancestor(distance: number): Environment {
        let environment: Environment = this;
        for (let i = 0; i < distance; i++) {
            environment = environment.enclosing;
        }
    
        return environment;
    }

    getAt(distance: number, name: string) {
        return this.ancestor(distance).values.get(name)!;
    }

    assignAt(distance: number, name: Token, value: any) {
        this.ancestor(distance).values.set(name.value, value);
    }

}
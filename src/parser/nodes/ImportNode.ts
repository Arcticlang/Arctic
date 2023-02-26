import Token from "../../lexer/Token";
import Node from "./Node";

export default class ImportNode extends Node {
    name: Token;
    package: boolean;

    constructor(name: Token, pgk: boolean) {
        super();
        this.name = name;
        this.package = pgk;
    }

    toString(): string {
        let result = `import`;
        if(this.package) result += " package";
        result += ` ${this.name.value}`;
        return result;
    }
    
}
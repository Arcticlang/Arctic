import Node from "./Node";
import Token from '../../lexer/Token';

export default class VarReAssignNode extends Node {
    name: Token;
    value: Node;

    constructor(name: Token, value: Node) {
        super();
        this.name = name;
        this.value = value;

        this.posStart = this.name.posStart;
        this.posEnd = this.value.posEnd;
    }

    toString(): any {
        return `(${this.name}: ${this.value})`;
    }

}
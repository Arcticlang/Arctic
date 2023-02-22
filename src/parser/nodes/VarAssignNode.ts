import Node from "./Node";
import Token from '../../lexer/Token';

export default class VarAssignNode extends Node {
    type: Token;
    name: Token;
    value: Node;

    constructor(type: Token, name: Token, value: Node) {
        super();
        this.type = type;
        this.name = name;
        this.value = value;

        this.posStart = this.type.posStart;
        this.posEnd = this.value ? this.value.posEnd : this.name.posEnd;
    }

    toString(): any {
        return `(${this.type} ${this.name}: ${this.value ? this.value.toString() : "null"})`;
    }

}
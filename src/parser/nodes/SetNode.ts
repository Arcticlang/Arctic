import Token from "../../lexer/Token";
import Node from "./Node";

export default class SetNode extends Node {
    object: Node;
    name: Token;
    value: Node;

    constructor(object: Node, name: Token, value: Node) {
        super();
        this.object = object;
        this.name = name;
        this.value = value;

        this.posStart = this.object.posStart;
        this.posEnd = this.value.posEnd;
    }

    toString(): string {
        return `(${this.object.toString()}.${this.name.value} = ${this.value.toString()})`;
    }

}
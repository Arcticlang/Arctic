import Token from "../../lexer/Token";
import Node from "./Node";

export default class GetNode extends Node {
    object: Node;
    name: Token;

    constructor(object: Node, name: Token) {
        super();
        this.object = object;
        this.name = name;

        this.posStart = this.object.posStart;
        this.posEnd = this.name.posEnd;
    }

    toString(): string {
        return `(${this.object.toString()}.${this.name.value})`;
    }

}
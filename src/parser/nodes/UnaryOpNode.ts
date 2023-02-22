import Token from "../../lexer/Token";
import Node from "./Node";

export default class UnaryOpNode extends Node {
    node: Node;
    opTok: Token;

    constructor(opTok: Token, node: Node) {
        super();
        this.opTok = opTok;
        this.node = node;

        this.posStart = this.opTok.posStart;
        this.posEnd = this.node.posEnd;
    }

    toString() {
        return `(${this.opTok.toString()}, ${this.node.toString()})`;
    }

}
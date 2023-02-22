import Node from "./Node";
import Token from '../../lexer/Token';

export default class BinOpNode extends Node {
    leftNode: Node;
    opTok: Token;
    rightNode: Node;

    constructor(leftNode: Node, opTok: Token, rightNode: Node) {
        super();
        this.leftNode = leftNode;
        this.opTok = opTok;
        this.rightNode = rightNode;

        this.posStart = this.leftNode.posStart;
        this.posEnd = this.rightNode.posEnd;
    }

    toString() {
        return `(${this.leftNode.toString()}, ${this.opTok.toString()}, ${this.rightNode.toString()})`;
    }

}
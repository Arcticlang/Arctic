import Node from "./Node";
import Token from '../../lexer/Token';

export default class LiteralNode extends Node {
    token: Token;

    constructor(token: Token) {
        super();
        this.token = token;

        this.posStart = this.token.posStart;
        this.posEnd = this.token.posEnd;
    }

    toString(): any {
        return this.token.toString();
    }

}
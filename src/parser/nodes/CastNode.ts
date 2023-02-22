import Token from "../../lexer/Token";
import Node from "./Node";

export default class CastNode extends Node {
    castor: Token;
    casting: Node;

    constructor(castor: Token, casting: Node) {
        super();
        this.castor = castor;
        this.casting = casting;

        this.posStart = castor.posStart;
        this.posEnd = casting.posEnd;
    }

    toString(): string {
        return `cast ${this.casting.toString()} to ${this.castor.value}`;
    }

}
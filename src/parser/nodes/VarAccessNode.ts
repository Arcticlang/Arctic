import Token from "../../lexer/Token";
import Node from "./Node";

export default class VarAccessNode extends Node {
    varNameToken: Token;

    constructor(varNameToken: Token) {
        super();
        this.varNameToken = varNameToken;

        this.posStart = this.varNameToken.posStart;
        this.posEnd = this.varNameToken.posEnd;
    }

    toString(): any {
        return this.varNameToken;
    }

}
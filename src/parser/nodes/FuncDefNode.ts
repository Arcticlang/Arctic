import Node from "./Node";
import Token from '../../lexer/Token';

export type TypedArg = {
    type: Token;
    name: Token;
}

export default class FuncDefNode extends Node {
    type: Token;
    name: Token;
    argNameTokens: TypedArg[];
    bodyNode: Node[];

    constructor(type: Token, name: Token, argNameTokens: TypedArg[], bodyNode: Node[]) {
        super();
        this.type = type;
        this.name = name;
        this.argNameTokens = argNameTokens;
        this.bodyNode = bodyNode;

        this.posStart = this.type.posStart;
        this.posEnd = this.bodyNode[this.bodyNode.length - 1].posEnd;
    }

    toString(): any {
        return `(${this.type} ${this.name}: ${this.bodyNode})`;
    }

}
import Node from "./Node";
import Token from '../../lexer/Token';

export default class ReturnNode extends Node {
    keyword: Token;
    value: Node;

    constructor(keyword: Token, value: Node) {
        super();
        this.keyword = keyword;
        this.value = value;

        this.posStart = this.keyword.posStart;
        this.posEnd = this.value.posEnd;
    }

    toString(): string {
        return `return ${this.value.toString()}`;
    }

}
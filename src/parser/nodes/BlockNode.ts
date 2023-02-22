import Node from "./Node";

export default class BlockNode extends Node {
    statements: Array<Node>;

    constructor(statements: Array<Node>) {
        super();
        this.statements = statements;
    }

    toString(): string {
        return `${this.statements.join(" ")}`;
    }

}
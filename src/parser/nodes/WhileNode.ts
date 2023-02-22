import Node from "./Node";

export default class WhileNode extends Node {
    conditionNode: Node;
    bodyNode: Node;

    constructor(conditionNode: Node, bodyNode: Node) {
        super();
        this.conditionNode = conditionNode;
        this.bodyNode = bodyNode;

        this.posStart = this.conditionNode.posStart;
        this.posEnd = this.bodyNode.posEnd;
    }

    toString(): string {
        return `while ${this.conditionNode} ${this.bodyNode}`;
    }

}
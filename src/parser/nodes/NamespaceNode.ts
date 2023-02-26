import Token from "../../lexer/Token";
import Node from "./Node";
import VarAssignNode from './VarAssignNode';
import FuncDefNode from './FuncDefNode';
import ClassNode from './ClassNode';

export default class NamespaceNode extends Node {
    name: Token;
    properties: VarAssignNode[];
    methods: FuncDefNode[];
    classes: ClassNode[];

    constructor(name: Token, properties: VarAssignNode[], methods: FuncDefNode[], classes: ClassNode[]) {
        super();

        this.name = name;
        this.properties = properties;
        this.methods = methods;
        this.classes = classes;

        this.posStart = this.name.posStart;
        this.posEnd = this.name.posEnd;
    }

    toString(): string {
        return `${this.name.value} namespace`;
    }

}
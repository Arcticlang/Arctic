import Node from "./Node";
import Token from "../../lexer/Token";
import FuncDefNode from "./FuncDefNode";
import VarAssignNode from "./VarAssignNode";

export default class ClassNode extends Node {
	name: Token;
	methods: FuncDefNode[];
	properties: VarAssignNode[];

	constructor(name: Token, properties: VarAssignNode[], methods: FuncDefNode[]) {
		super();
		this.name = name;
        this.properties = properties;
		this.methods = methods;

		this.posStart = this.name.posStart;
		let lastMethod = this.methods[this.methods.length - 1];
		this.posEnd = lastMethod ? lastMethod.posEnd : this.name.posEnd;
	}

	toString(): string {
		return `class ${this.name.value}`;
	}
}

import BinOpNode from "../parser/nodes/BinOpNode";
import Node from "../parser/nodes/Node";
import LiteralNode from "../parser/nodes/LiteralNode";
import UnaryOpNode from "../parser/nodes/UnaryOpNode";
import Token from "../lexer/Token";
import RuntimeError from "../errors/RuntimeError";
import Environment from "./Environment";
import VarAssignNode from "../parser/nodes/VarAssignNode";
import VarAccessNode from "../parser/nodes/VarAccessNode";
import VarReAssignNode from "../parser/nodes/VarReAssignNode";
import BlockNode from "../parser/nodes/BlockNode";
import IfNode from "../parser/nodes/IfNode";
import LogicalNode from "../parser/nodes/LogicalNode";
import WhileNode from "../parser/nodes/WhileNode";
import CallNode from "../parser/nodes/CallNode";
import CastNode from "../parser/nodes/CastNode";
import Typing from "./Typing";
import FuncDefNode from "../parser/nodes/FuncDefNode";
import Function from "./values/Function";
import ReturnNode from '../parser/nodes/ReturnNode';
import Return from "./Return";
import ClassNode from "../parser/nodes/ClassNode";
import GetNode from "../parser/nodes/GetNode";
import SetNode from "../parser/nodes/SetNode";
import ThisNode from "../parser/nodes/ThisNode";
import NamespaceNode from '../parser/nodes/NamespaceNode';
import ImportNode from "../parser/nodes/ImportNode";

import { Class, Callable, isCallable, Namespace, Instance, ArcticPackage } from "arcticpackage";

export function getattr(obj: any, prop: any, defaultValue: any = null) {
	if (prop in obj) {
		let val = obj[prop];
		if (typeof val === "function") return val.bind(obj);
		return val;
	}

	if (arguments.length > 2) {
		return defaultValue;
	}

	throw new TypeError(`"${obj}" object has no attribute "${prop}"`);
}

export default class Interpreter {
	static interpreter: Interpreter = new Interpreter();
	globals: Environment = new Environment();
	private environment: Environment = this.globals;

	private readonly locals: Map<Node, number> = new Map();

	constructor() {}

	interpret(statements: Node[]) {
		this.environment = this.globals;
		try {
			for (let statement of statements) {
				this.visit(statement);
			}
		} catch (e) {
			console.log(e);
		}
		return this.environment;
	}

	visit(node: Node) {
		let methodName = `visit_${node.constructor.name}`;
		let method = getattr(this, methodName, this.noVisitMethod.bind(this));
		return method(node);
	}

	noVisitMethod(node: Node) {
		throw new Error(`No visit_${node.constructor.name}, method defined`);
	}

	visit_LiteralNode(node: LiteralNode) {
		return node.token.value;
	}

	visit_ImportNode(node: ImportNode) {
		let location = node.name;
		if(node.package) {
			this.environment.loadPackage(location);
		} else {
			this.environment.loadFile(location);
		}
	}

	visit_CastNode(node: CastNode) {
		let expr = this.visit(node.casting);
		return this.castTo(expr, node.castor);
	}

	visit_BinOpNode(node: BinOpNode) {
		let left = this.visit(node.leftNode);
		let right = this.visit(node.rightNode);

		switch (node.opTok.type) {
			case "PLUS":
				if (typeof left === "number" && typeof right === "number") {
					return left + right;
				}

				if (typeof left === "string" && typeof right === "string") {
					return left + right;
				}
				throw new RuntimeError(
					"Operands must be two numbers or two strings.",
					node.posStart,
					node.posEnd
				);
			case "MINUS":
				this.checkNumberOperands(node.opTok, left, right);
				return left - right;
			case "MUL":
				this.checkNumberOperands(node.opTok, left, right);
				return left * right;
			case "DIV":
				this.checkNumberOperands(node.opTok, left, right);
				return left / right;
			case "POW":
				this.checkNumberOperands(node.opTok, left, right);
				return left ** right;
			case "MOD":
				this.checkNumberOperands(node.opTok, left, right);
				return left % right;

			case "EQUAL_EQUAL":
				return this.isEqual(left, right);
			case "BANG_EQUAL":
				return !this.isEqual(left, right);

			case "LESS":
				this.checkNumberOperands(node.opTok, left, right);
				return left < right;
			case "LESS_EQUAL":
				this.checkNumberOperands(node.opTok, left, right);
				return left <= right;
			case "GREATER":
				this.checkNumberOperands(node.opTok, left, right);
				return left > right;
			case "GREATER_EQUAL":
				this.checkNumberOperands(node.opTok, left, right);
				return left >= right;
		}

		return null;
	}

	visit_LogicalNode(node: LogicalNode) {
		let left = this.visit(node.leftNode);

		if (node.opTok.type == "OR") {
			if (this.isTruthy(left)) return left;
		} else {
			if (!this.isTruthy(left)) return left;
		}

		return this.visit(node.rightNode);
	}

	visit_UnaryOpNode(node: UnaryOpNode) {
		let right = this.visit(node.node);

		switch (node.opTok.type) {
			case "BANG":
				return !this.isTruthy(right);
			case "MINUS":
				this.checkNumberOperand(node.opTok, right);
				return -right;
		}

		return null!;
	}

	visit_VarAssignNode(node: VarAssignNode) {
		let value: any = null;
		if (node.value != null) {
			value = this.visit(node.value);
		}

		if (!Typing.validate(node.type, value) && value != null) {
			throw new RuntimeError(
				`Variable value for ${node.name.value} does not match type of ${node.type.value}`,
				node.posStart,
				node.posEnd
			);
		}

		this.environment.define(node.name.value, value);
		return value;
	}

	visit_VarAccessNode(node: VarAccessNode) {
		return this.lookUpVariable(node.varNameToken, node);
	}

	visit_VarReAssignNode(node: VarReAssignNode) {
		let value = this.visit(node.value);
		let prevValue = this.environment.get(node.name);

		if (typeof prevValue != typeof value) {
			throw new RuntimeError(
				`Variable value for ${node.name.value} does not match type.`,
				node.posStart,
				node.posEnd
			);
		}

		let distance = this.locals.get(node);
		if(distance != null) {
			this.environment.assignAt(distance, node.name, value);
		} else {
			this.globals.assign(node.name, value);
		}

		this.environment.assign(node.name, value);
		return value;
	}

	visit_FuncDefNode(node: FuncDefNode) {
		let func = new Function(node, this.environment, false);
		this.environment.define(node.name.value, func);
		return null;
	}

	visit_ClassNode(node: ClassNode) {
		this.environment.define(node.name.value, null);

		this.environment.assign(node.name, this.makeClass(node));
		return null;
	}

	visit_NamespaceNode(node: NamespaceNode) {
		let name = node.name.value;
		this.environment.define(name, null);

		let properties = new Map<string, any>();
		for(let klass of node.classes) {
			properties.set(klass.name.value, this.makeClass(klass));
		}

		for(let method of node.methods) {
			let func = new Function(method, this.environment, method.name.value == node.name.value);
			properties.set(method.name.value, func);
		}

		for(let property of node.properties) {
			properties.set(property.name.value, this.visit(property));
		}

		let namespace = new Namespace(name, properties);
		this.environment.assign(node.name, namespace);
		return null;
	}

	visit_ReturnNode(node: ReturnNode) {
		let value = null;
		if(node.value != null) value = this.visit(node.value);

		throw new Return(value);
	}

	visit_WhileNode(node: WhileNode) {
		while (this.isTruthy(this.visit(node.conditionNode))) {
			this.visit(node.bodyNode);
		}
		return null;
	}

	visit_CallNode(node: CallNode) {
		let callee = this.visit(node.nodeToCall);

		// console.log(callee);

		let args = new Array<any>();
		for (let argument of node.argNodes) {
			args.push(this.visit(argument));
		}

		if (!isCallable(callee)) {
			throw new RuntimeError(
				"Can only call functions and classes.",
				node.posStart,
				node.posEnd
			);
		}

		let func = <Callable>callee;
		if (args.length != func.arity) {
			throw new RuntimeError(
				`Expected ${func.arity} arguments but got ${args.length}`,
				node.posStart,
				node.posEnd
			);
		}
		return func.call(args);
	}

	visit_BlockNode(node: BlockNode) {
		this.executeBlock(node.statements, new Environment(this.environment));
		return null;
	}

	visit_IfNode(node: IfNode) {
		let ifOccured = false;
		for (let stmt of node.cases) {
			if (ifOccured) break;
			if (this.isTruthy(this.visit(stmt.condition))) {
				this.visit(stmt.body);
				ifOccured = true;
			}
		}

		if (node.elseCase != null && !ifOccured) {
			this.visit(node.elseCase);
		}
		return null;
	}

	visit_GetNode(node: GetNode) {
		let object = this.visit(node.object);

		if(object instanceof Instance || object instanceof Namespace || object instanceof ArcticPackage) {
			let value;
			try {
				value = object.get(node.name.value);
			} catch(str) {
				throw new RuntimeError(str as string, node.name.posStart, node.name.posEnd);
			}
			return value!;
		}

		throw new RuntimeError("Only instances and namespaces have properties.", node.posStart, node.posEnd);
	}

	visit_SetNode(node: SetNode) {
		let object = this.visit(node.object);

		if(!(object instanceof Instance)) {
			throw new RuntimeError("Only instances have fields.", node.posStart, node.posEnd);
		}

		let value = this.visit(node.value);
		object.set(node.name.value, value);
		return value;
	}

	visit_ThisNode(node: ThisNode) {
		return this.lookUpVariable(node.token, node);
	}

	makeClass(node: ClassNode) {
		let methods = new Map<string, Function>();
		for(let method of node.methods) {
			let func = new Function(method, this.environment, method.name.value == node.name.value);
			methods.set(method.name.value, func);
		}

		let properties = new Map<string, any>();
		for(let property of node.properties) {
			properties.set(property.name.value, this.visit(property));
		}

		let klass = new Class(node.name.value, methods, properties);
		return klass;
	}

	lookUpVariable(name: Token, node: Node) {
		let distance = this.locals.get(node);
		if(distance != null) {
			return this.environment.getAt(distance, name.value);
		}
		return this.globals.get(name);
	}

	resolve(node: Node, depth: number) {
		this.locals.set(node, depth);
	}

	executeBlock(statements: Array<Node>, environment: Environment) {
		let previous = this.environment;
		try {
			this.environment = environment;

			for (let statement of statements) {
				this.visit(statement);
			}
		} finally {
			this.environment = previous;
		}
	}

	checkNumberOperand(operator: Token, operand: any) {
		if (typeof operand === "number") return;
		throw new RuntimeError(
			"Operand must be a number.",
			operator.posStart,
			operator.posEnd
		);
	}

	checkNumberOperands(operator: Token, left: any, right: any) {
		if (typeof left === "number" && typeof right === "number") return;

		throw new RuntimeError(
			"Operands must be numbers",
			operator.posStart,
			operator.posEnd
		);
	}

	castTo(object: any, castTo: Token) {
		if (castTo.value == "string") {
			if(object instanceof Instance) return object.toString();
			return ("" + object) as string;
		} else if (castTo.value == "number") {
			return object as number;
		}
		throw new RuntimeError(
			`Cannot cast ${typeof object} to ${castTo.value}`,
			castTo.posStart,
			castTo.posEnd
		);
	}

	isTruthy(object: any) {
		if (object == null) return false;
		if (typeof object == "boolean") return object;
		return true;
	}

	isEqual(a: any, b: any) {
		if (a == null && b == null) return true;
		if (a == null) return false;

		return a == b;
	}
}

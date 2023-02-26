import RuntimeError from "../errors/RuntimeError";
import Interpreter, { getattr } from "../interpreter/Interpreter";
import Token from "../lexer/Token";
import BinOpNode from "../parser/nodes/BinOpNode";
import BlockNode from "../parser/nodes/BlockNode";
import FuncDefNode from "../parser/nodes/FuncDefNode";
import IfNode from "../parser/nodes/IfNode";
import Node from "../parser/nodes/Node";
import ReturnNode from "../parser/nodes/ReturnNode";
import VarAccessNode from "../parser/nodes/VarAccessNode";
import VarAssignNode from "../parser/nodes/VarAssignNode";
import VarReAssignNode from "../parser/nodes/VarReAssignNode";
import WhileNode from "../parser/nodes/WhileNode";
import Stack from "./Stack";
import CallNode from "../parser/nodes/CallNode";
import LiteralNode from "../parser/nodes/LiteralNode";
import LogicalNode from "../parser/nodes/LogicalNode";
import UnaryOpNode from "../parser/nodes/UnaryOpNode";
import GetNode from "../parser/nodes/GetNode";
import SetNode from "../parser/nodes/SetNode";
import CastNode from "../parser/nodes/CastNode";
import ClassNode from "../parser/nodes/ClassNode";
import ThisNode from "../parser/nodes/ThisNode";
import NamespaceNode from "../parser/nodes/NamespaceNode";
import ImportNode from "../parser/nodes/ImportNode";

export enum FunctionType {
	NONE,
	FUNCTION,
	INITALIZER,
	METHOD,
}

export enum ClassType {
	NONE,
	CLASS,
	SUBCLASS,
}

export default class Resolver {
	private readonly interpreter: Interpreter;
	private readonly scopes: Stack<Map<string, boolean>> = new Stack();

	private currentFunction: FunctionType = FunctionType.NONE;
	private currentClass: ClassType = ClassType.NONE;

	constructor(interpreter: Interpreter) {
		this.interpreter = interpreter;
	}

	visit(node: Node) {
		let methodName = `visit_${node.constructor.name}`;
		let method = getattr(this, methodName, this.noVisitMethod.bind(this));
		return method(node);
	}

	noVisitMethod(node: Node) {
		throw new Error(`No visit_${node.constructor.name}, method defined`);
	}

	visit_BlockNode(node: BlockNode) {
		this.beginScope();
		this.resolve(node.statements);
		this.endScope();
		return null;
	}

	visit_ClassNode(node: ClassNode) {
		this.declare(node.name);
		this.define(node.name);

		this.resolveClass(node, ClassType.CLASS);
		return null;
	}

	visit_NamespaceNode(node: NamespaceNode) {
		this.declare(node.name);
		this.define(node.name);

		this.beginScope();

		for (let property of node.properties) {
			this.declare(property.name);
			this.define(property.name);
		}

		for (let method of node.methods) {
			this.resolveFunction(method, FunctionType.METHOD);
		}

		for (let klass of node.classes) {
			this.resolveClass(klass, ClassType.CLASS);
		}

		this.endScope();
		return null;
	}

	visit_ThisNode(node: ThisNode) {
		if (this.currentClass == ClassType.NONE) {
			throw new RuntimeError(
				"Can't use 'this' outside of a class.",
				node.posStart,
				node.posEnd
			);
		}
		this.resolveLocal(node, node.token);
		return null;
	}

	visit_VarAssignNode(node: VarAssignNode) {
		this.declare(node.name);
		if (node.value != null) {
			this.resolve(node.value);
		}
		this.define(node.name);
		return null;
	}

	visit_VarAccessNode(node: VarAccessNode) {
		if (
			!this.scopes.isEmpty() &&
			this.scopes.peek().get(node.varNameToken.value) == false
		) {
			throw new RuntimeError(
				"Can't readt local variable in it's own initalizer.",
				node.varNameToken.posStart,
				node.varNameToken.posEnd
			);
		}

		this.resolveLocal(node, node.varNameToken);
		return null;
	}

	visit_VarReAssignNode(node: VarReAssignNode) {
		this.resolve(node.value);
		this.resolveLocal(node, node.name);
		return null;
	}

	visit_FuncDefNode(node: FuncDefNode) {
		this.declare(node.name);
		this.define(node.name);

		this.resolveFunction(node, FunctionType.FUNCTION);
		return null;
	}

	visit_CallNode(node: CallNode) {
		this.resolve(node.nodeToCall);

		for (let argument of node.argNodes) {
			this.resolve(argument);
		}

		return null;
	}

	visit_GetNode(node: GetNode) {
		this.resolve(node.object);
		return null;
	}

	visit_SetNode(node: SetNode) {
		this.resolve(node.value);
		this.resolve(node.object);
		return null;
	}

	visit_CastNode(node: CastNode) {
		this.resolve(node.casting);
		return null;
	}

	visit_IfNode(node: IfNode) {
		for (let _case of node.cases) {
			this.resolve(_case.condition);
			this.resolve(_case.body);
		}
		if (node.elseCase != null) this.resolve(node.elseCase);
		return null;
	}

	visit_WhileNode(node: WhileNode) {
		this.resolve(node.conditionNode);
		this.resolve(node.bodyNode);
		return null;
	}

	visit_ReturnNode(node: ReturnNode) {
		if (this.currentFunction == FunctionType.NONE) {
			throw new RuntimeError(
				"Can't return from top-level code.",
				node.posStart,
				node.posEnd
			);
		}

		if (node.value != null) {
			if (this.currentFunction == FunctionType.INITALIZER) {
				throw new RuntimeError(
					"Can't return a value from an initializer.",
					node.posStart,
					node.posEnd
				);
			}
			this.resolve(node.value);
		}

		return null;
	}

	visit_BinOpNode(node: BinOpNode) {
		this.resolve(node.leftNode);
		this.resolve(node.rightNode);
		return null;
	}

	visit_LogicalNode(node: LogicalNode) {
		this.resolve(node.leftNode);
		this.resolve(node.rightNode);
		return null;
	}

	visit_UnaryOpNode(node: UnaryOpNode) {
		this.resolve(node.node);
		return null;
	}

	visit_LiteralNode(node: LiteralNode) {
		return null;
	}

	visit_ImportNode(node: ImportNode) {
		return null;
	}

	beginScope() {
		this.scopes.push(new Map());
	}

	endScope() {
		this.scopes.pop();
	}

	declare(name: Token) {
		if (this.scopes.isEmpty()) return;

		let scope = this.scopes.peek();
		if (scope.has(name.value)) {
			throw new RuntimeError(
				"Already a variable with this name in this scope.",
				name.posStart,
				name.posEnd
			);
		}
		scope.set(name.value, false);
	}

	define(name: Token) {
		if (this.scopes.isEmpty()) return;
		this.scopes.peek().set(name.value, true);
	}

	resolveLocal(node: Node, name: Token) {
		for (let i = this.scopes.size() - 1; i >= 0; i--) {
			if (this.scopes.get(i).has(name.value)) {
				this.interpreter.resolve(node, this.scopes.size() - 1 - i);
				return;
			}
		}
	}

	resolveClass(node: ClassNode, classType: ClassType) {
		let enclosingClass = this.currentClass;
		this.currentClass = classType;

		this.beginScope();
		this.scopes.peek().set("this", true);

		for (let property of node.properties) {
			this.declare(property.name);
			this.define(property.name);
		}

		for (let method of node.methods) {
			let declaration = FunctionType.METHOD;
			if (method.name.value === node.name.value) {
				declaration = FunctionType.INITALIZER;
			}

			this.resolveFunction(method, declaration);
		}

		this.endScope();

		this.currentClass = enclosingClass;
	}

	resolveFunction(func: FuncDefNode, type: FunctionType) {
		let enclosingFunction = this.currentFunction;
		this.currentFunction = type;

		this.beginScope();
		for (let param of func.argNameTokens) {
			this.declare(param.name);
			this.define(param.name);
		}
		this.resolve(func.bodyNode);
		this.endScope();

		this.currentFunction = enclosingFunction;
	}

	resolve(statements: Node[] | Node) {
		if (statements instanceof Array) {
			for (let statement of statements) {
				this.resolve(statement);
			}
		} else {
			this.visit(statements);
		}
	}
}

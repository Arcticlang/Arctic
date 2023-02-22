import FuncDefNode from "../../parser/nodes/FuncDefNode";
import Environment from "../Environment";
import Interpreter from "../Interpreter";
import { Callable } from "./Callable";
import util from "util";
import Typing from "../Typing";
import RuntimeError from "../../errors/RuntimeError";
import Return from "../Return";
import Instance from "./Instance";

export default class Function implements Callable {
	private declaration: FuncDefNode;
	private readonly closure: Environment;
	private readonly isInitializer: boolean;

	constructor(declaration: FuncDefNode, closure: Environment, isInitializer: boolean) {
		this.declaration = declaration;
		this.closure = closure;
		this.isInitializer = isInitializer;
	}

	bind(instance: Instance) {
		let environment = new Environment(this.closure);
		environment.define("this", instance);
		return new Function(this.declaration, environment, this.isInitializer);
	}

	get arity() {
		return this.declaration.argNameTokens.length;
	}

	call(interpreter: Interpreter, args: any[]) {
		let environment = new Environment(this.closure);
		for (let i = 0; i < this.declaration.argNameTokens.length; i++) {
			let param = this.declaration.argNameTokens[i];
			if (!Typing.validate(param.type, args[i])) {
				throw new RuntimeError(
					`Argument is not of type ${param.name.value}`,
					param.type.posStart,
					param.name.posEnd
				);
			}

			environment.define(param.name.value, args[i]);
		}

		try {
			interpreter.executeBlock(this.declaration.bodyNode, environment);
		} catch (returnValue) {
			if (!(returnValue instanceof Return)) return null;
			if(this.isInitializer) return this.closure.getAt(0, "this");
			if (!Typing.validate(this.declaration.type, returnValue.value)) {
				throw new RuntimeError(
					`Return value of ${this.declaration.name.value} does not match the type.`,
					this.declaration.posStart,
					this.declaration.type.posEnd
				);
			}
			return returnValue.value;
		}

		if(this.isInitializer) return this.closure.getAt(0, "this");
		return null;
	}

	[util.inspect.custom]() {
		return `<function ${this.declaration.name.value}>`;
	}
}
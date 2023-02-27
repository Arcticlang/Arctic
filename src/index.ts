#!/usr/bin/env node

import fs from "fs";
import FileError from "./errors/FileError";
import Interpreter from "./interpreter/Interpreter";
import Lexer from "./lexer/Lexer";
import Parser from "./parser/Parser";
import Resolver from "./resolver/Resolver";
import ArcticError from './errors/ArcticError';
import ArcticFunction from './api/ArcticFunction';
import ArcticPackage from './api/ArcticPackage';
import Class from './interpreter/values/Class';
import Namespace from './interpreter/values/Namespace';
import CallableFunction from './interpreter/values/CallableFunction';
import { Callable } from './interpreter/values/Callable';
import Typing from './interpreter/Typing';
import Instance from './interpreter/values/Instance';

function runFile(file: string) {
	if (file.trim() == "") {
		console.log(new FileError("Please input a file."));
		return;
	}

	if (!fs.existsSync(file)) {
		console.log(new FileError(`File '${file}' does not exist.`));
		return;
	}

	const data = fs.readFileSync(file, "utf-8");

	const lexer = new Lexer(file, data);
	const { tokens, error } = lexer.tokenize();
	if (error) {
		console.log(error);
		return;
	}

	const parser = new Parser(tokens);
	const statements = parser.parse();
	if (statements == null) return;
	// console.log(expression);

	let resolver = new Resolver(Interpreter.interpreter);
	try {
		resolver.resolve(statements);
	} catch (e) {
		console.log(e);
		return;
	}

	return Interpreter.interpreter.interpret(statements);
}

export {
	ArcticError,
	ArcticFunction,
	ArcticPackage,
	Class,
	Namespace,
	Interpreter,
	CallableFunction,
	Callable,
    Typing,
    Instance,
	runFile
};

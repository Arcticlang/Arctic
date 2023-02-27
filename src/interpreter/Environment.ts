import path from "path";
import os from "os";
import RuntimeError from "../errors/RuntimeError";
import Token from "../lexer/Token";
import fs from "fs";
import ArcticPackage from "../api/ArcticPackage";
import { runFile } from "..";

export type IceagePackage = {
	name: string;
	displayName: string;
	description: string;
	version: string;
	author: string;
	entry: string;
	repo: string;
	tests: string[];
	addons: string[];
	dependencies: string[];
};

export default class Environment {
	readonly enclosing: Environment;
	readonly values: Map<string, any> = new Map();

	constructor(enclosing: Environment = null!) {
		this.enclosing = enclosing;
	}

	loadFile(token: Token) {
		let execPath = token.posStart.fn.split("/");
		execPath.splice(execPath.length - 1, 1);
		let name = path.join(...execPath, token.value);
		
        if(!fs.existsSync(name)) 
			throw new RuntimeError(
				`File does not exist.`,
				token.posStart,
				token.posEnd
			);

		const fileEnv = runFile(name);
		if(!fileEnv) return;
		this.add(fileEnv);
	}

	loadPackage(token: Token) {
		if (this.enclosing != null) {
			return;
		}
		
		let name = token.value;

		let arcticTemp = path.join(os.homedir(), ".arctic", "packages");
		if(!fs.existsSync(arcticTemp)) fs.mkdirSync(arcticTemp, { recursive: true });

		let packagePath = path.join(arcticTemp, name);
        let packageConfigPath = path.join(packagePath, "iceage-package.json");
        if(!fs.existsSync(packageConfigPath)) 
            throw new RuntimeError(
                `Requested package doesn't contain a 'iceage-package.json'.`,
                token.posStart,
                token.posEnd
            );
		let packageConfig = JSON.parse(
			fs.readFileSync(
				packageConfigPath,
				"utf-8"
			)
		) as IceagePackage;

		let mainFile = packageConfig.entry;
		let mainFilePath = path.join(packagePath, mainFile);

		if (mainFile.endsWith(".js")) {
			let pgk = require(mainFilePath).default as ArcticPackage;
			if(!pgk) 
				throw new RuntimeError(
					`No default export found from package '${packageConfig.displayName}'.`,
					token.posStart,
					token.posEnd
				);
			this.values.set(name, pgk);
			return;
		}
		
		const fileEnv = runFile(mainFilePath);
		if (fileEnv == undefined) return;
		const pgk = new ArcticPackage(name);
		pgk.addPropertiesFromEnvironment(fileEnv);
		this.values.set(name, pgk);
	}

	add(environment: Environment) {
		environment.values.forEach((value, key) => {
			this.values.set(key, value);
		}, this);
	}

	get(name: Token): any {
		if (this.values.has(name.value)) {
			return this.values.get(name.value)!;
		}

		if (this.enclosing != null) return this.enclosing.get(name);

		throw new RuntimeError(
			`Undefined variable '${name.value}'.`,
			name.posStart,
			name.posEnd
		);
	}

	assign(name: Token, value: any) {
		if (this.values.has(name.value)) {
			this.values.set(name.value, value);
			return;
		}

		if (this.enclosing != null) {
			this.enclosing.assign(name, value);
			return;
		}

		throw new RuntimeError(
			`Undefined variable '${name.value}'.`,
			name.posStart,
			name.posEnd
		);
	}

	define(name: string, value: any) {
		this.values.set(name, value);
	}

	ancestor(distance: number): Environment {
		let environment: Environment = this;
		for (let i = 0; i < distance; i++) {
			environment = environment.enclosing;
		}

		return environment;
	}

	getAt(distance: number, name: string) {
		return this.ancestor(distance).values.get(name)!;
	}

	assignAt(distance: number, name: Token, value: any) {
		this.ancestor(distance).values.set(name.value, value);
	}
}

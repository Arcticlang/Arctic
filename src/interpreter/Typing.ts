import { Instance } from "arcticpackage";
import Token from "../lexer/Token";

export default class Typing {

    static validate(type: Token, value: any) {
		if(value == null) return true;
        if(type.value == "void") return true;

		if(type.value == "any") return true;
		
		if(typeof value == "number" && type.value == "number") return true;
		else if(typeof value == "string" && type.value == "string") return true;
		else if(typeof value == "boolean" && type.value == "boolean") return true;
		else if(value instanceof Instance) {
			if(value.klass.name === type.value) return true;
		}
		// else if(value instanceof LoxInstance) { 
		// 	if(((LoxInstance) value).klass.name.equals(type.lexeme)) return true;
		// }

        return false;
    }

}
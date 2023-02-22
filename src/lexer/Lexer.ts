import ArcticError from "../errors/ArcticError";
import Token, { keywords, TokenType, types } from "./Token";
import IllegalCharError from '../errors/IllegalCharError';
import Position from "../Position";
import ExpectedCharError from "../errors/ExpectedCharError";

const digits = '0123456789';
let characters = 'abcdefghijklmnopqrstuvwxyz';
characters += characters.toUpperCase();

export type AddToken = (type: TokenType, value?: any) => void;
export type MakeFunction = { token: Token, error: ArcticError };

export default class Lexer {

    private pos: Position;
    private data: string;
    private currentChar: string;

    constructor(fn: string, data: string) {
        this.data = data;
        this.pos = new Position(-1, 0, -1, fn, data);
        this.currentChar = null!;
        this.advance();
    }

    advance() {
        this.pos.advance();
        this.currentChar = this.pos.idx < this.data.length ? this.data[this.pos.idx] : null!;
    }

    tokenize(): { tokens: Token[], error: ArcticError } {
        let tokens: Token[] = [];

        const addToken = (type: TokenType, value: any=null, posStart: Position=null!, posEnd: Position=null!) => {
            if(posStart == null) posStart = this.pos;
            tokens.push(new Token(type, value, posStart, posEnd));
            this.advance();
        }

        while(this.currentChar != null) {
            if(" \t\r\n".includes(this.currentChar)) {
                this.advance();
            } else if(digits.includes(this.currentChar)) {
                let { error, token } = this.makeNumber();
                if(error) return { tokens: [], error };
                tokens.push(token);
            } else if(characters.includes(this.currentChar)) {
                tokens.push(this.makeIdentifier());
            } 
            else if(this.currentChar == ';') addToken("SEMICOLON");
            else if(this.currentChar == '"') tokens.push(this.makeString());
            else if(this.currentChar == '#') this.skipComment();
            else if(this.currentChar == '+') addToken("PLUS");
            else if(this.currentChar == '-') addToken("MINUS");
            else if(this.currentChar == '*') addToken("MUL");
            else if(this.currentChar == '/') addToken("DIV");
            else if(this.currentChar == '^') addToken("POW");
            else if(this.currentChar == '%') addToken("MOD");
            else if(this.currentChar == '(') addToken("LPAREN");
            else if(this.currentChar == ')') addToken("RPAREN");
            else if(this.currentChar == '{') addToken("LBRACE");
            else if(this.currentChar == '}') addToken("RBRACE");
            else if(this.currentChar == '[') addToken("LSQUARE");
            else if(this.currentChar == ']') addToken("RSQUARE");
            else if(this.currentChar == ',') addToken("COMMA");
            else if(this.currentChar == '.') addToken("DOT");
            else if(this.currentChar == '!') tokens.push(this.makeNotEqual());
            else if(this.currentChar == '<') tokens.push(this.makeLesserThan());
            else if(this.currentChar == '>') tokens.push(this.makeGreaterThan());
            else if(this.currentChar == '=') tokens.push(this.makeEqual());
            else if(this.currentChar == '&') {
                let { error, token } = this.makeAnd();
                if(error) return { tokens: [], error };
                tokens.push(token);
            } else if(this.currentChar == '|') {
                let { error, token } = this.makeOr();
                if(error) return { tokens: [], error };
                tokens.push(token);
            } else {
                let posStart = this.pos.copy();
                let character = this.currentChar;
                this.advance();
                return { tokens: [], error: new IllegalCharError(`'${character}'`, posStart, this.pos) };
            }
        }

        addToken("EOF");
        return { tokens, error: null! };
    }

    // makePlus() {
    //     let tokType: TokenType = "PLUS";
    //     let posStart = this.pos.copy();
    //     this.advance();

    //     if(this.currentChar == '+') {
    //         this.advance();
    //         tokType = "INC";
    //     }

    //     return new Token(tokType, null!, posStart, this.pos);
    // }

    // makeMinus() {
    //     let tokType: TokenType = "MINUS";
    //     let posStart = this.pos.copy();
    //     this.advance();

    //     if(this.currentChar == '-') {
    //         this.advance();
    //         tokType = "DEINC";
    //     }

    //     return new Token(tokType, null!, posStart, this.pos);
    // }

    makeAnd(): MakeFunction {
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == "&") {
            this.advance();
            return { token: new Token("AND", null!, posStart, this.pos), error: null! };
        }

        return { token: null!, error: new ExpectedCharError(`'&' (after '&')`, posStart, this.pos) };
    }

    makeOr(): MakeFunction {
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == "|") {
            this.advance();
            return { token: new Token("OR", null!, posStart, this.pos), error: null! };
        }

        return { token: null!, error: new ExpectedCharError(`'|' (after '|')`, posStart, this.pos) };
    }

    makeEqual() {
        let tokType: TokenType = "EQUAL";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = "EQUAL_EQUAL";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeNotEqual() {
        let tokType: TokenType = "BANG";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = "BANG_EQUAL";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeLesserThan() {
        let tokType: TokenType = "LESS";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = "LESS_EQUAL";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeGreaterThan() {
        let tokType: TokenType = "GREATER";
        let posStart = this.pos.copy();
        this.advance();

        if(this.currentChar == '=') {
            this.advance();
            tokType = "GREATER_EQUAL";
        }

        return new Token(tokType, null!, posStart, this.pos);
    }

    makeString(): Token {
        let string = "";
        let posStart = this.pos.copy();
        let escapeCharacter = false;
        this.advance();

        let escapeCharacters = {
            n: "\n",
            t: "\t"
        }

        while(this.currentChar != null && (this.currentChar != '"' || escapeCharacter)) {
            if(escapeCharacter) {
                string += (escapeCharacters as any)[this.currentChar];
            } else {
                if(this.currentChar == '\\') {
                    escapeCharacter = true;
                } else {
                    string += this.currentChar;
                }
            }

            this.advance();
            escapeCharacter = false;
        }

        this.advance();
        return new Token("STRING", string, posStart, this.pos);
    }

    makeNumber(): MakeFunction {
        let posStart = this.pos.copy();
        let numStr = "";
        let nums = digits;
        nums += ".";
        let dotCount = 0;

        while(this.currentChar != null && nums.includes(this.currentChar)) {
            if(this.currentChar == '.') {
                dotCount++;
                numStr += '.';
            } else {
                numStr += this.currentChar;
            }
            this.advance();
        }

        if(dotCount > 1) {
            return { token: null!, error: new IllegalCharError(`More than one '.' found in type number.`, posStart, posStart.advance()) };
        }

        return { token: new Token("NUMBER", parseFloat(numStr), posStart, this.pos), error: null! };
    }

    makeIdentifier() {
        let idStr = "";
        let posStart = this.pos.copy();
        let letterNumbers = characters + digits;

        while(this.currentChar != null && letterNumbers.includes(this.currentChar)) {
            idStr += this.currentChar;
            this.advance();
        }

        let tokType: TokenType = keywords.includes(idStr) ? "KEYWORD" : types.includes(idStr) ? "TYPE" : "IDENTIFIER";
        return new Token(tokType, idStr, posStart, this.pos);
    }

    skipComment() {
        this.advance();

        while(this.currentChar != '\n') {
            this.advance();
        }

        this.advance();
    }

}
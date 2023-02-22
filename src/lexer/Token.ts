import util from "util";
import Position from "../Position";

export type TokenType = 
    | "PLUS" | "MINUS" | "MUL" | "DIV" | "POW" | "MOD"
    | "EQUAL" | "EQUAL_EQUAL" | "LESS" | "LESS_EQUAL" | "GREATER" | "GREATER_EQUAL" | "BANG" | "BANG_EQUAL"
    | "AND" | "OR" 
    | "COMMA" | "DOT"
    | "LPAREN" | "RPAREN" | "LBRACE" | "RBRACE" | "LSQUARE" | "RSQUARE"
    | "NUMBER" | "STRING" | "IDENTIFIER"
    | "KEYWORD" | "TYPE" 
    | "SEMICOLON" | "NEWLINE"
    | "EOF";

export const keywords: string[] = [
    "var",
    "func",

    "if",
    "else",
    "elif",

    "for",
    "while",

    "return",
    "break",
    "continue",

    "class",
    "this"
];

export const types = [
    "number",
    "string",
    "boolean",
    "void"
];

export default class Token {

    readonly type: TokenType;
    readonly value: any;

    posStart!: Position;
    posEnd!: Position;

    constructor(type: TokenType, value: any=null, posStart: Position=null!, posEnd: Position=null!) {
        this.type = type;
        this.value = value;

        if(posStart) {
            this.posStart = posStart.copy();
            this.posEnd = posStart.copy().advance();
        }

        if(posEnd) {
            this.posEnd = posEnd.copy();
        }
    }

    matches(type: TokenType, value: any=null) {
        return this.type == type && this.value == value;
    }

    toString() {
        if(this.value != null) return `${this.type}:${this.value}`;
        return this.type;
    }

    [util.inspect.custom]() {
        return this.toString();
    }

}
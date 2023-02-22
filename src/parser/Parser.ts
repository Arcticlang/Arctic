import Token from "../lexer/Token";
import { TokenType } from '../lexer/Token';
import LiteralNode from './nodes/LiteralNode';
import BinOpNode from './nodes/BinOpNode';
import InvalidSyntaxError from '../errors/InvalidSyntaxError';
import UnaryOpNode from './nodes/UnaryOpNode';
import VarAccessNode from "./nodes/VarAccessNode";
import VarAssignNode from './nodes/VarAssignNode';
import Node from "./nodes/Node";
import IfNode, { IfCase } from "./nodes/IfNode";
import WhileNode from './nodes/WhileNode';
import FuncDefNode, { TypedArg } from "./nodes/FuncDefNode";
import CallNode from "./nodes/CallNode";
import Position from "../Position";
import VarReAssignNode from "./nodes/VarReAssignNode";
import BlockNode from './nodes/BlockNode';
import LogicalNode from "./nodes/LogicalNode";
import CastNode from './nodes/CastNode';
import ReturnNode from "./nodes/ReturnNode";
import ClassNode from "./nodes/ClassNode";
import GetNode from "./nodes/GetNode";
import SetNode from './nodes/SetNode';
import ThisNode from "./nodes/ThisNode";

export default class Parser {

    current: number;
    tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }

    advance() {
        if(!this.isAtEnd()) this.current++;
        return this.previous();
    }

    parse() {
        let statements = new Array<Node>();
        while(!this.isAtEnd()) {
            let declaration = this.declaration();
            if(declaration == null) break;
            statements.push(declaration);
        }

        return statements;
    }

    reverse(amount: number=1) {
        this.current -= amount;
        return this.peek();
    }

    declaration(): Node {
        try {
            if(this.matchKeyword("class")) return this.classDeclaration();
            if(this.matchKeyword("var")) return this.varDeclaration();
            if(this.matchKeyword("func")) return this.function("function");

            return this.statement();
        } catch(e) {
            console.log(e);
            return null!;
        }
    }

    statement() {
        if(this.match("LBRACE")) return new BlockNode(this.block());
        if(this.matchKeyword("if")) return this.ifStatement();
        if(this.matchKeyword("while")) return this.whileStatement();
        if(this.matchKeyword("return")) return this.returnStatement();
        if(this.matchKeyword("for")) return this.forStatement();

        return this.expression();
    }

    classDeclaration(): Node {
        let name = this.consume("IDENTIFIER", "Expect class name.");
        this.consume("LBRACE", "Expect '{' before class body.");

        let properties = new Array<VarAssignNode>();
        let methods = new Array<FuncDefNode>();
        while(!this.check("RBRACE") && !this.isAtEnd()) {
            if(this.matchKeyword("var")) {
                properties.push(this.varDeclaration());
                continue;
            }
            methods.push(this.function("method"));
        }

        this.consume("RBRACE", "Expect '}' after class body.");

        return new ClassNode(name, properties, methods);
    }

    returnStatement(): Node {
        let keyword = this.previous();
        let value: Node = null!;

        try {
            value = this.expression();
        } catch {
            if(!value) {
                this.reverse();
            }
        }
    

        return new ReturnNode(keyword, value);
    }

    forStatement(): Node {
        this.consume("LPAREN", "Expect '(' after 'for'.");

        let initializer;
        if(this.match("SEMICOLON")) {
            initializer = null;
        } else if(this.matchKeyword("var")) {
            initializer = this.varDeclaration();
        } else {
            initializer = this.expression();
        }
        this.consume("SEMICOLON", "Expect ';' after variable declaration.");

        let condition = null;
        if(!this.check("SEMICOLON")) {
            condition = this.expression();
        }
        this.consume("SEMICOLON", "Expect ';' after loop condition.");

        let increment = null;
        if(!this.check("RPAREN")) {
            increment = this.expression();
        }

        // console.log(initializer, condition, increment);
        this.consume("RPAREN", "Expect ')' after for clauses.");

        let body = this.statement();

        if(increment != null) {
            body = new BlockNode([
                body,
                increment
            ])
        }

        if(condition == null) condition = new LiteralNode(new Token("NUMBER", 1));
        body = new WhileNode(condition, body);

        if(initializer != null) {
            body = new BlockNode([
                initializer, 
                body
            ]);
        }

        return body;
    }

    whileStatement(): Node {
        this.consume("LPAREN", "Expect '(' after 'while'.");
        let condition = this.expression();
        this.consume("RPAREN", "Expect ')' after condition.");
        let body = this.statement();

        return new WhileNode(condition, body);
    }

    ifStatement() {
        this.consume("LPAREN", "Expect '(' after 'if'.");
        let condition = this.expression();
        this.consume("RPAREN", "Expect ')' after if condition.");

        let cases: IfCase[] = [];

        while(this.matchKeyword("elif")) {
            this.consume("LPAREN", "Expect '(' after 'if'.");
            let condition = this.expression();
            this.consume("RPAREN", "Expect ')' after if condition.");
            let thenBranch = this.statement();
            cases.push({ condition, body: thenBranch });
        }

        let thenBranch = this.statement();
        let elseBranch: Node = null!;
        if(this.matchKeyword("else")) {
            elseBranch = this.statement();
        }

        cases.push({ condition, body: thenBranch });

        return new IfNode(cases, elseBranch);
    }

    block() {
        let statements = new Array<Node>();

        while(!this.check("RBRACE") && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        
        this.consume("RBRACE", "Expect '}' after block.");
        return statements;
    }

    varDeclaration(): VarAssignNode {
        let type: Token;
        if(this.match("TYPE", "IDENTIFIER")) {
            type = this.previous();
        } else {
            this.error("Expect parameter type.", this.peek().posStart, this.peek().posEnd);
        }
        let name = this.consume("IDENTIFIER", "Expect identifier (after type).");

        let initializer: Node = null!;
        if(this.match("EQUAL")) {
            initializer = this.expression();
        }

        return new VarAssignNode(type!, name, initializer);
    }

    function(kind: string): FuncDefNode {
        let type: Token;
        if(this.match("TYPE", "IDENTIFIER")) {
            type = this.previous();
        } else {
            this.error("Expect parameter type.", this.peek().posStart, this.peek().posEnd);
        }

        let name = this.consume("IDENTIFIER", "Expect identifier (after type).");
        this.consume("LPAREN", `Expect '(' after ${kind} name.`);
        let parameters = new Array<TypedArg>();
        if(!this.check("RPAREN")) {
            do {
                let paramType: Token;
                if(this.match("TYPE", "IDENTIFIER")) {
                    paramType = this.previous();
                } else {
                    this.error("Expect parameter type.", this.peek().posStart, this.peek().posEnd);
                }
                let paramName = this.consume("IDENTIFIER", "Expect parameter name.");
                parameters.push({
                    type: paramType!,
                    name: paramName
                });
            } while(this.match("COMMA"));
        }
        this.consume("RPAREN", "Expect ')' after parameters.");

        this.consume("LBRACE", `Expect '{' before ${kind} body.`);
        let body = this.block();
        return new FuncDefNode(type!, name, parameters, body);
    }

    expression() {
        let assignment = this.assignment();
        return assignment;
    }

    assignment(): Node {
        let expr = this.or();

        if(this.match("EQUAL")) {
            let equal = this.previous();
            let value = this.assignment();

            if(expr instanceof VarAccessNode) {
                let name = expr.varNameToken;
                return new VarReAssignNode(name, value)
            } else if(expr instanceof GetNode) {
                let get = <GetNode> expr;
                return new SetNode(get.object, get.name, expr);
            }

            this.error("Invalid assignment target.", equal.posStart, equal.posEnd);
        }

        return expr;
    }

    or(): Node {
        let expr = this.and();

        while(this.match("OR")) {
            let operator = this.previous();
            let right = this.and();
            expr = new LogicalNode(expr, operator, right);
        }

        return expr;
    }

    and(): Node {
        let expr = this.equality();

        while(this.match("AND")) {
            let operator = this.previous();
            let right = this.equality();
            expr = new LogicalNode(expr, operator, right);
        }

        return expr;
    }

    equality(): Node {
        let expr: Node = this.comparison();

        while(this.match("BANG_EQUAL", "EQUAL_EQUAL")) {
            let operator = this.previous();
            let right = this.comparison();
            expr = new BinOpNode(expr, operator, right);
        }

        return expr;
    }

    comparison(): Node {
        let expr = this.term();

        while(this.match("GREATER", "GREATER_EQUAL", "LESS", "LESS_EQUAL")) {
            let operator = this.previous();
            let right = this.term();
            expr = new BinOpNode(expr, operator, right);
        }

        return expr;
    }

    term(): Node {
        let expr = this.factor();

        while(this.match("MINUS", "PLUS")) {
            let operator = this.previous();
            let right = this.factor();
            expr = new BinOpNode(expr, operator, right);
        }

        return expr;
    }

    factor(): Node {
        let expr = this.unary();

        while(this.match("DIV", "MUL", "MOD", "POW")) {
            let operator = this.previous();
            let right = this.unary();
            expr = new BinOpNode(expr, operator, right);
        }

        return expr;
    }

    unary(): Node {
        if(this.match("BANG", "MINUS")) {
            let operator = this.previous();
            let right = this.unary();
            return new UnaryOpNode(operator, right);
        }

        return this.call();
    }

    call(): Node {
        let expr = this.primary();

        while(true) {
            if(this.match("LPAREN")) {
                expr = this.finishCall(expr);
            } else if(this.match("DOT")) {
                let name = this.consume("IDENTIFIER", "Expect property name after '.'.");
                expr = new GetNode(expr, name);
            } else {
                break;
            }
        }

        return expr;
    }

    finishCall(callee: Node) {
        let args = new Array<Node>();
        if(!this.check("RPAREN")) {
            do {
                args.push(this.expression());
            } while(this.match("COMMA"));
        }

        this.consume("RPAREN", "Expect ')' after arguments.");

        return new CallNode(callee, args);
    }

    primary(): Node {
        if(this.match("NUMBER", "STRING"))  {
            return new LiteralNode(this.previous());
        }

        if(this.match("LPAREN")) {
            let expr = this.expression();

            this.consume("RPAREN", "Expected ')'.");
            return expr;
        }

        if(this.match("LESS")) {
            let castor: Token;
            if(this.match("TYPE", "IDENTIFIER")) {
                castor = this.previous();
            } else {
                this.error("Expect type or identifier.", this.peek().posStart, this.peek().posEnd);
                return null!;
            }
            this.consume("GREATER", "Expected '>' after cast.");

            let expr = this.expression();
            return new CastNode(castor, expr);
        }

        if(this.match("IDENTIFIER")) {
            return new VarAccessNode(this.previous());
        }

        if(this.matchKeyword("this")) return new ThisNode(this.previous());

        throw this.error("Expect expression.", this.peek().posStart, this.peek().posEnd);
    }

    match(...types: TokenType[]) {
        for(let type of types) {
            if(this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    matchKeyword(lexeme: string) {
		if(this.check("KEYWORD") && this.peek().value == lexeme) {
            this.advance();
			return true;
		}
		return false;
	}

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    isAtEnd() {
        return this.peek().type == "EOF";
    }

    check(type: TokenType) {
        if(this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    consume(type: TokenType, message: string) {
        if(this.check(type)) {
            this.advance();
            return this.previous();
        }

        let token = this.peek();
        throw this.error(message, token.posStart, token.posEnd);
    }

    error(message: string, posStart: Position, posEnd: Position) {
        return new InvalidSyntaxError(message, posStart, posEnd);
    }

}
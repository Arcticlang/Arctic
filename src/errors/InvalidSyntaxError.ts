import Position from "../Position";
import ArcticError from "./ArcticError";

export default class InvalidSyntaxError extends ArcticError {
    constructor(details: string, posStart: Position, posEnd: Position) {
        super('Invalid Syntax', details, posStart, posEnd);
    }
}
import Position from '../Position';
import ArcticError from './ArcticError';

export default class ExpectedCharError extends ArcticError {
    constructor(details: string, posStart: Position, posEnd: Position) {
        super('Expected Character', details, posStart, posEnd);
    }
}
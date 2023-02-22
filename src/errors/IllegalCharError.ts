import Position from '../Position';
import ArcticError from './ArcticError';

export default class IllegalCharError extends ArcticError {
    constructor(details: string, posStart: Position, posEnd: Position) {
        super('Illegal Character', details, posStart, posEnd);
    }
}
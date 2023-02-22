import util from 'util';
import ArcticError, { stringWithArrows } from './ArcticError';
import Position from '../Position';

export default class RuntimeError extends ArcticError {
    constructor(details: string, posStart: Position, posEnd: Position) {
        super('Runtime Error', details, posStart, posEnd);
    }

    [util.inspect.custom]() {
		// let result = this.generateTraceback();
        let result = `${this.name}: ${this.details}\n`;
        result += `\n\n${stringWithArrows(this.posStart.ftxt, this.posStart, this.posEnd)}`;
		return result;
	}

    // generateTraceback(): string {
    //     let result = '';
    //     let pos = this.posStart;
    //     let ctx = this.context;

    //     while(ctx) {
    //         result = `  File ${pos.fn}, line ${pos.ln + 1}, in ${ctx.displayName}\n${result}`;
    //         pos = ctx.parentEntryPos;
    //         ctx = ctx.parent;
    //     }

    //     return `Traceback (most recent call last):\n${result}`;
    // }

}
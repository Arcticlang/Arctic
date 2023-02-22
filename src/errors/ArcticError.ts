import util from "util";
import Position from "../Position";

export function stringWithArrows(text: string, posStart: Position, posEnd: Position) {
	var result = '';

    var idxStart = Math.max(text.lastIndexOf('\n', posStart.idx), 0);
    var idxEnd = text.indexOf('\n', idxStart + 1)
    if(idxEnd < 0) idxEnd = text.length;

    var lineCount = posEnd.ln - posStart.ln + 1
    for(var i = 0; i < lineCount; i++) {
        var line = text.substring(idxStart, idxEnd);
        var colStart;
        if(i == 0) colStart = posStart.col
        else colStart = 0;
        var colEnd;
        if(i == lineCount - 1) colEnd = posEnd.col
        else colEnd = line.length - 1;
        
        result += line + '\n';
        result += " ".repeat(colStart)
        result += "^".repeat((colEnd - colStart))

        idxStart = idxEnd;
        idxEnd = text.indexOf('\n', idxStart + 1)
        if(idxEnd < 0) idxEnd = text.length;
    }

    return result;
}

export default class ArcticError {
	constructor(
		public readonly name: string,
		public readonly details: string,
		public readonly posStart: Position,
		public readonly posEnd: Position
	) {}

	[util.inspect.custom]() {
		let result = `${this.name}: ${this.details}\n`;
		if(this.posStart) {
			result += `File ${this.posStart.fn}, line ${this.posStart.ln + 1}`;
			result += `\n\n${stringWithArrows(this.posStart.ftxt, this.posStart, this.posEnd)}`;
		} 
		return result;
	}
}

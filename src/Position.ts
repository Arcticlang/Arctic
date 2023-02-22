export default class Position {

    constructor(public idx: number, public ln: number, public col: number, public fn: string, public ftxt: string) {}

    advance(currentChar?: string) {
        this.idx++;
        this.col++;

        if(currentChar == '\n') {
            this.ln++;
            this.col = 0;
        }

        return this;
    }

    copy() {
        return new Position(this.idx, this.ln, this.col, this.fn, this.ftxt);
    }

}
import Node from "./Node";

export interface IfCase {
    condition: Node;
    body: Node;
}

export default class IfNode extends Node {
    cases: IfCase[];
    elseCase: Node;

    constructor(cases: IfCase[], elseCase: Node) {
        super();
        this.cases = cases;
        this.elseCase = elseCase;

        this.posStart = this.cases[0].condition.posStart;
        this.posEnd = (this.elseCase || this.cases[this.cases.length - 1].condition).posEnd;
    }

    toString(): any {
        let result = `if ${this.cases[0].condition} ${this.cases[0].body}`;
        let i = 0
        for(let ifCase of this.cases) {
            if(i == 0) continue;
            result += ` elif ${ifCase.condition} ${ifCase.body};`
            i++; 
        }
        
        if(this.elseCase) {
            result += ` else ${this.elseCase}`;
        }
        return result;
    }
}
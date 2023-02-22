import Interpreter from "../Interpreter";

export interface Callable {
    arity: number;
    call(interpreter: Interpreter, args: any[]): any;
}

export function isCallable(obj: any): obj is Callable {
    if(!obj) return false;
    return 'call' in obj;
}
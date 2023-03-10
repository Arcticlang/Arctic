import { ArcticFunction, Class } from 'arcticpackage';

export default class String extends Class {

    constructor() {
        super("String", new Map(), new Map());

        let _this = this;

        this.setMethod(new ArcticFunction("String", {
            arity: 1,
            call(args) {
                let value = args[0];
                if(typeof value != "string") {
                    console.log(`Runtime Error: Expected string got ${typeof value} instead.`);
                    return;
                }
                _this.set("value", value);
            },
        }));

        this.setMethod(new ArcticFunction("length", {
            arity: 0,
            call(args) {
                return (_this.findProperty("value") as string).length;
            },
        }));
    }

}
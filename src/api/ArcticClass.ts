import Class from "../interpreter/values/Class";

export default class ArcticClass extends Class {

    constructor(name: string) {
        super(name, new Map(), new Map());
    }

}
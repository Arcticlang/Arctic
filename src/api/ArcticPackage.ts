import CallableFunction from "../interpreter/values/CallableFunction";
import Class from "../interpreter/values/Class";
import Namespace from "../interpreter/values/Namespace";
import Environment from '../interpreter/Environment';

/*
import package "test"

test.hello()
*/

export default class ArcticPackage extends Namespace {
    readonly name: string;

    constructor(name: string) {
        super(name, new Map(), new Map(), new Map());
        this.name = name;
    }

    addClass(klass: Class) {
        this.classes.set(klass.name, klass);
    }

    addMethod(method: CallableFunction) {
        this.methods.set(method.name, method);
    }

    addProperty(name: string, value: any) {
        this.properties.set(name, value);
    }

    addPropertiesFromEnvironment(environment: Environment) {
        environment.values.forEach((value, key) => {
            this.addProperty(key, value);
        }, this);
    }

}
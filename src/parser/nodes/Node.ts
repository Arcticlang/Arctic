import Position from "../../Position";
import util from 'util';

export default abstract class Node {
    posStart!: Position;
    posEnd!: Position;

    abstract toString(): string;

    [util.inspect.custom]() {
        return this.toString();
    }
}
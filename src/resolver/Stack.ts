export default class Stack<T> {
    private items: T[];

    constructor() {
        this.items = [];
    }

    push(element: T) {
        this.items.push(element);
    }

    pop() {
        if(this.isEmpty()) return null!;
        return this.items.pop();
    }

    peek() {
        return this.items[this.items.length - 1];
    }

    get(index: number) {
        if(this.isEmpty()) return null!;
        return this.items[index];
    }

    size() {
        return this.items.length;
    }

    isEmpty() {
        return this.items.length == 0;
    }

    printStack() {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i] + " ";
        return str;
    }
}
class Console {
    var string name

    Console Console(string name) {
        this.name = name
    }

    string getName() {
        return this.name
    }

}

var Console c = Console("Hello World")
println(<string> c.getName())
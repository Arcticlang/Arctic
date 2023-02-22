class Console {
    var string name

    void Console(string name) {
        this.name = name
        println(this.name)
    }

    string getName() {
        return this.name
    }

}

var Console c = Console("Hello World")
println(<string> c.getName())
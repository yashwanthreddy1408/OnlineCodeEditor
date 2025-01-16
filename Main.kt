fun main() {
    val name = "John"  // String variable
    var age = 25      // Integer variable

    println("Hello, $name. You are $age years old.")
    
    // Intentional errors below:

    // 1. Variable 'age' is changed to a string instead of an integer.
    age = "twenty-five"

    // 2. Missing closing bracket on the println statement
    println("This is a sentence without closing parentheses"
    
    // 3. Trying to call a method on an undefined variable
    undefinedMethod()
    
    // 4. Using a variable before it’s initialized (uninitialized 'address')
    println("Address: $address")
}

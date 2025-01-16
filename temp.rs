// Online Rust Code Editor
// Write, Edit and Run your Rust code using CodeCraft

fn main() {
    // Iterate through numbers from 2 to 20
    for num in 2..=20 {
        // Check if the number is prime
        if is_prime(num) {
            println!("{}", num);
        }
    }
}

// Function to check if a number is prime
fn is_prime(num: u32) -> bool {
    // 0 and 1 are not prime numbers
    if num <= 1 {
        return false;
    }

    // Iterate from 2 to the square root of num
    // If num is divisible by any of these, it's not prime
    for i in 2..=((num as f64).sqrt() as u32) {
        if num % i == 0 {
            return false;
        }
    }

    // If no divisor was found, num is prime
    true
}

// Online Java Editor
// Write, Edit and Run your Java code using Java Online Compiler

import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Create a Scanner object to read input from the user
        Scanner scanner = new Scanner(System.in);

        //  Prompt the user to enter their name
        // System.out.print("Enter your name: ");

        // Read the input from the user
        String name = scanner.nextLine();

        // Print a greeting message
        System.out.println("Hello, " + name + "! Welcome to the Java Code Editor.");

        // Close the Scanner object
        scanner.close();
    }
}

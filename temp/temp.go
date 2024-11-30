package main

// fmt package provides the function to print anything 
import "fmt"

func main() {

   // defining integer with var keyword
   var currentYear int
   
   // initialize the variable
   currentYear = 1976
   
   // printing the variable using println() function
   fmt.Println("What is the current year? It's", currentYear, "Using Println function")
   
   // printing the variable using printf() function
   fmt.Printf("What is the current year? It's %d using Printf function ", currentYear)
}
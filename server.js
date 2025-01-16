const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const app = express();
const fs = require("fs");
const port = 3002;
const { exec } = require("child_process");
const path = require("path");

// Middleware to parse JSON bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files (not necessary if using a frontend build system like webpack)
app.use(express.static("public"));

// CORS Middleware (if needed)
app.use(cors());

// Endpoint to handle user registration (signup)
// app.post("/signup", (req, res) => {
//   const { email, username, password } = req.body;

//   if (!email || !username || !password) {
//     return res
//       .status(400)
//       .json({ error: "Email, username, and password are required" });
//   }

//   // Check if the user already exists
//   const checkUserQuery = "SELECT * FROM users WHERE email = ?";
//   db.query(checkUserQuery, [email], (err, results) => {
//     if (err) {
//       console.error("Error checking user:", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (results.length > 0) {
//       return res.status(409).json({ error: "User already exists" });
//     }

//     // Hash the password before storing it in the database
//     bcrypt.hash(password, 10, (err, hashedPassword) => {
//       if (err) {
//         console.error("Error hashing password:", err);
//         return res.status(500).json({ error: "Failed to hash password" });
//       }

//       // Insert new user into database with hashed password
//       const insertUserQuery =
//         "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
//       db.query(
//         insertUserQuery,
//         [email, username, hashedPassword],
//         (err, results) => {
//           if (err) {
//             console.error("Error creating user:", err);
//             return res.status(500).json({ error: "Failed to create user" });
//           }
//           res.json({ message: "User registered successfully" });
//         }
//       );
//     });
//   });
// });

// // Endpoint to handle user authentication (signin)
// app.post("/signin", (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   const findUserQuery = "SELECT * FROM users WHERE email = ?";
//   db.query(findUserQuery, [email], (err, results) => {
//     if (err) {
//       console.error("Error finding user:", err);
//       return res.status(500).json({ error: "Database error" });
//     }

//     if (results.length === 0) {
//       console.log("No user found with the provided email");
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     bcrypt.compare(password, results[0].password, (err, passwordMatch) => {
//       if (err) {
//         console.error("Error comparing passwords:", err);
//         return res.status(500).json({ error: "Authentication error" });
//       }

//       if (!passwordMatch) {
//         console.log("Password does not match for the provided email");
//         return res.status(401).json({ error: "Invalid email or password" });
//       }

//       // Set session to indicate the user is logged in
//       req.session.loggedIn = true;
//       req.session.userId = results[0].id;
//       console.log("User authenticated successfully");
//       res.json({ message: "Login successful" });
//     });
//   });
// });

// // Endpoint to check if the user is logged in
// app.get("/api/check-login", (req, res) => {
//   if (req.session.loggedIn) {
//     res.json({ loggedIn: true });
//   } else {
//     res.json({ loggedIn: false });
//   }
// });

// // Endpoint to handle user logout
// app.post("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ error: "Failed to log out" });
//     }
//     res.json({ message: "Logout successful" });
//   });
// });

// Endpoint to handle POST request for executing Python code
app.post("/execute_python", (req, res) => {
  const { code, inputs } = req.body;

  const tempFile = "temp.py";
  fs.writeFileSync(tempFile, code);

  let command = `python3 ${tempFile}`;

  const child = exec(command, (error, stdout, stderr) => {
    fs.unlinkSync(tempFile); // Clean up the temp file
    if (error) {
      res.json({ output: stderr });
      return;
    }
    res.json({ output: stdout });
  });

  if (inputs && inputs.length > 0) {
    inputs.forEach((input) => {
      child.stdin.write(input + "\n");
    });
    child.stdin.end();
  }
});

// Endpoint to handle POST request for executing C++ code
app.post("/execute_cpp", (req, res) => {
  const { code, inputs } = req.body;

  const fileName = "temp.cpp";
  const codeFilePath = path.join(__dirname, "temp", fileName);
  const executablePath = path.join(__dirname, "temp", "temp.exe");

  const compileCommand = `g++ -o ${executablePath} ${codeFilePath}`;

  fs.writeFile(codeFilePath, code, (err) => {
    if (err) {
      console.error("Error writing code file:", err);
      return res.status(500).json({ error: "Failed to write code file" });
    }

    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        console.error("Compilation Error:", compileError);
        console.error("Compilation stderr:", compileStderr);
        return res
          .status(500)
          .json({ error: "Compilation failed", stderr: compileStderr });
      }

      const child = exec(
        executablePath,
        { timeout: 10000 },
        (execError, stdout, stderr) => {
          if (execError) {
            console.error("Execution Error:", execError);
            console.error("Execution stderr:", stderr);
            return res
              .status(500)
              .json({ error: "Execution failed", stderr: stderr });
          }
          console.log("stdout:", stdout);
          console.error("stderr:", stderr);
          res.json({ output: stdout, error: stderr });
        }
      );

      if (inputs && inputs.length > 0) {
        inputs.forEach((input) => {
          child.stdin.write(input + "\n");
        });
        child.stdin.end();
      }
    });
  });
});

// Endpoint to handle POST request for executing Java code
app.post("/execute_java", (req, res) => {
  const { code, inputs } = req.body;

  // Extract class name from Java code
  const className = extractClassName(code);
  if (!className) {
    return res.status(400).json({ error: "Class name not found in Java code" });
  }

  // Create temporary Java file
  const javaFilePath = path.join(__dirname, "temp", `${className}.java`);
  const javaCompileCommand = `javac ${javaFilePath}`;

  fs.writeFile(javaFilePath, code, (err) => {
    if (err) {
      console.error("Error writing Java file:", err);
      return res.status(500).json({ error: "Failed to write Java file" });
    }

    exec(javaCompileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        console.error("Compilation Error:", compileError);
        console.error("Compilation stderr:", compileStderr);
        return res
          .status(500)
          .json({ error: "Compilation failed", stderr: compileStderr });
      }

      const javaExecCommand = `java -cp ${path.join(
        __dirname,
        "temp"
      )} ${className}`;
      const child = exec(
        javaExecCommand,
        { timeout: 10000 },
        (execError, stdout, stderr) => {
          if (execError) {
            console.error("Execution Error:", execError);
            console.error("Execution stderr:", stderr);
            return res
              .status(500)
              .json({ error: "Execution failed", stderr: stderr });
          }
          console.log("stdout:", stdout);
          console.error("stderr:", stderr);
          res.json({ output: stdout, error: stderr });
        }
      );

      if (inputs && inputs.length > 0) {
        inputs.forEach((input) => {
          child.stdin.write(input + "\n");
        });
        child.stdin.end();
      }
    });
  });
});

// Endpoint to handle POST request for executing C code
app.post("/execute_c", (req, res) => {
  const { code, inputs } = req.body;

  // Create temporary C file
  const cFilePath = path.join(__dirname, "temp", "temp.c");
  const cCompileCommand = `gcc -o ${path.join(
    __dirname,
    "temp",
    "temp"
  )} ${cFilePath}`;

  fs.writeFile(cFilePath, code, (err) => {
    if (err) {
      console.error("Error writing C file:", err);
      return res.status(500).json({ error: "Failed to write C file" });
    }

    exec(cCompileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        console.error("Compilation Error:", compileError);
        console.error("Compilation stderr:", compileStderr);
        return res
          .status(500)
          .json({ error: "Compilation failed", stderr: compileStderr });
      }

      const child = exec(
        path.join(__dirname, "temp", "temp"),
        { timeout: 10000 },
        (execError, stdout, stderr) => {
          if (execError) {
            console.error("Execution Error:", execError);
            console.error("Execution stderr:", stderr);
            return res
              .status(500)
              .json({ error: "Execution failed", stderr: stderr });
          }
          console.log("stdout:", stdout);
          console.error("stderr:", stderr);
          res.json({ output: stdout, error: stderr });
        }
      );

      if (inputs && inputs.length > 0) {
        inputs.forEach((input) => {
          child.stdin.write(input + "\n");
        });
        child.stdin.end();
      }
    });
  });
});

// Helper function to extract class name from Java code
function extractClassName(javaCode) {
  // Regex to find class declaration
  const classRegex = /class\s+([a-zA-Z_$][a-zA-Z\d_$]*)\s*\{/;
  const match = javaCode.match(classRegex);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

app.post("/execute_csharp", (req, res) => {
  const { code, inputs } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No C# code provided" });
  }

  const fileName = "temp.cs";
  const filePath = path.join(__dirname, "temp", fileName);
  const executablePath = path.join(__dirname, "temp", "temp");

  // Write C# code to file
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      console.error("Error writing C# file:", err);
      return res.status(500).json({ error: "Failed to write C# file" });
    }

    // Compile C# code
    const compileCommand = `dotnet build ${filePath}`;
    exec(compileCommand, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        console.error("Compilation Error:", compileError);
        console.error("Compilation stderr:", compileStderr);
        return res
          .status(500)
          .json({ error: "Compilation failed", stderr: compileStderr });
      }

      // Execute compiled C# program
      exec(
        `${executablePath}`,
        { timeout: 10000, cwd: path.dirname(executablePath) },
        (execError, stdout, stderr) => {
          if (execError) {
            console.error("Execution Error:", execError);
            console.error("Execution stderr:", stderr);
            return res
              .status(500)
              .json({ error: "Execution failed", stderr: stderr });
          }
          console.log("stdout:", stdout);
          console.error("stderr:", stderr);
          res.json({ output: stdout, error: stderr });
        }
      );

      // Provide inputs to the program if any
      if (inputs && inputs.length > 0) {
        const inputString = inputs.join("\n");
        const inputFilePath = path.join(__dirname, "temp", "inputs.txt");
        fs.writeFile(inputFilePath, inputString, (inputErr) => {
          if (inputErr) {
            console.error("Error writing inputs file:", inputErr);
          } else {
            const child = exec(
              `${executablePath} < ${inputFilePath}`,
              { timeout: 10000, cwd: path.dirname(executablePath) },
              (execError, stdout, stderr) => {
                if (execError) {
                  console.error("Execution Error:", execError);
                  console.error("Execution stderr:", stderr);
                  return res
                    .status(500)
                    .json({ error: "Execution failed", stderr: stderr });
                }
                console.log("stdout:", stdout);
                console.error("stderr:", stderr);
                res.json({ output: stdout, error: stderr });

                // Clean up temporary inputs file
                fs.unlink(inputFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error("Error deleting inputs file:", unlinkErr);
                  }
                });
              }
            );
          }
        });
      }
    });
  });
});

// Route for handling PHP execution
app.post("/execute-php", (req, res) => {
  const phpCode = req.body.phpCode;

  // Validate phpCode
  if (!phpCode) {
    return res.status(400).send("PHP code is required");
  }

  // Write PHP code to a temporary file
  const tempFilePath = path.join(__dirname, "temp.php");
  fs.writeFileSync(tempFilePath, phpCode);

  // Use PHP CLI to execute the PHP file
  exec(`php ${tempFilePath}`, (error, stdout, stderr) => {
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(400).send(error.toString());
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(400).send(stderr.toString());
    }
    console.log(`stdout: ${stdout}`);
    res.send(stdout);
  });
});

app.post("/execute_ruby", (req, res) => {
  const { code, inputs } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  const filePath = "temp.rb";
  const inputFilePath = "inputs.txt";

  // Write Ruby code to a temporary file
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      console.error("Error writing code file:", err);
      return res.status(500).json({ error: "Error writing code file" });
    }

    // Write inputs to a temporary file
    fs.writeFile(inputFilePath, inputs.join("\n"), (err) => {
      if (err) {
        console.error("Error writing inputs file:", err);
        return res.status(500).json({ error: "Error writing inputs file" });
      }

      // Execute the Ruby code using the inputs
      exec(`ruby ${filePath} < ${inputFilePath}`, (err, stdout, stderr) => {
        if (err) {
          console.error("Error executing Ruby code:", err);
          console.error("Stderr:", stderr);
          return res.status(500).json({ error: "Error executing Ruby code" });
        }

        // Send the output back to the client
        res.json({ output: stdout || stderr });

        // Clean up temporary files
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting code file:", err);
        });
        fs.unlink(inputFilePath, (err) => {
          if (err) console.error("Error deleting inputs file:", err);
        });
      });
    });
  });
});

// Endpoint to handle POST request for executing Go code
app.post("/execute_go", (req, res) => {
  const { code, inputs } = req.body;

  const fileName = "temp.go";
  const filePath = path.join(__dirname, "temp", fileName);

  // Write Go code to file
  fs.writeFile(filePath, code, (err) => {
    if (err) {
      console.error("Error writing Go file:", err);
      return res.status(500).json({ error: "Failed to write Go file" });
    }

    // Execute Go program
    const command = `go run ${filePath}`;
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Execution error:", error);
        return res.status(500).json({ error: "Execution error", stderr });
      }

      // Output result
      res.status(200).json({ output: stdout, error: stderr });
    });

    // Provide inputs to the program if any
    if (inputs && inputs.length > 0) {
      child.stdin.setEncoding("utf-8");
      child.stdin.write(inputs.join("\n"));
      child.stdin.end();
    }
  });
});

// POST endpoint to execute Rust code
app.post("/execute_rust", (req, res) => {
  const { code, inputs } = req.body;

  // Create a unique temporary directory for each execution
  const tempDir = path.join(__dirname, "temp_" + Date.now());
  fs.mkdirSync(tempDir);

  // Write the code to a temporary Rust file within the directory
  const tmpFileName = path.join(tempDir, "temp.rs");
  fs.writeFile(tmpFileName, code, (err) => {
    if (err) {
      console.error("Error writing Rust code to file:", err);
      return res.status(500).json({ error: "Error writing Rust code to file" });
    }

    // Construct the command to compile and execute Rust code
    const executablePath = path.join(tempDir, "temp");
    const command = `rustc ${tmpFileName} -o ${executablePath} && echo "${inputs.join(
      "\n"
    )}" | ${executablePath}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      // Clean up temporary directory and files
      fs.rmSync(tempDir, { recursive: true, force: true });

      if (error) {
        console.error("Error executing Rust code:", error);
        return res.status(500).json({ error: "Error executing Rust code" });
      }
      console.log("Rust code output:", stdout);

      // Send the output back to the client
      res.json({ output: stdout });
    });
  });
});

app.post("/execute_swift", (req, res) => {
  const { code, inputs } = req.body;

  // Write Swift code to a temporary file
  const fs = require("fs");
  fs.writeFileSync("temp.swift", code);

  // Execute Swift code and capture output
  exec(`swift temp.swift`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).json({ output: `Execution error: ${error.message}` });
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      res.status(500).json({ output: `Execution stderr: ${stderr}` });
      return;
    }

    // Split stdout by lines and remove empty lines
    const outputLines = stdout.split("\n").filter((line) => line.trim() !== "");

    // Send output back to client
    res.json({ output: outputLines.join("\n") });
  });
});

app.post("/execute_kotlin", (req, res) => {
  const { code, inputs } = req.body;

  // Write the Kotlin code to a temporary file
  fs.writeFileSync("Main.kt", code);

  // Compile the Kotlin code
  exec(
    "kotlinc Main.kt -include-runtime -d Main.jar",
    (compileErr, stdout, stderr) => {
      if (compileErr) {
        return res.json({ output: stderr });
      }

      // Run the compiled Kotlin program
      exec(
        `echo "${inputs.join("\n")}" | java -jar Main.jar`,
        (runErr, runStdout, runStderr) => {
          if (runErr) {
            return res.json({ output: runStderr });
          }

          res.json({ output: runStdout });
        }
      );
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

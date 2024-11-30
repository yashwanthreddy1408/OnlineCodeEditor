# Online Code Editor

## Project Overview
This project is an interactive online code editor that allows users to write, test, and debug code in various programming languages directly from the browser. The application supports real-time code execution, syntax highlighting, and error detection to improve the coding experience.

## Features
- **CodeMirror Integration**: Code editing with syntax highlighting and line numbers.
- **Multi-language Support**: Supports Python, JavaScript, and C++ in the same interface.
- **Real-Time Code Execution**: Execute and run code directly in the browser.
- **Real-Time Error Display**: Errors in the code are displayed in real-time for quick debugging.
- **User Authentication**: Users can log in to save their code and settings.

## How to Use
1. Open the code editor in your browser.
2. Write your code in Python, JavaScript, or C++ in the editor.
3. Click the "Run" button to execute your code.
4. The output or any errors will be displayed in the output area.
5. You can log in to save your work and access it later.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js (Express.js)
- **Code Editor**: CodeMirror for syntax highlighting and code editing
- **Real-time Collaboration**: Socket.io for real-time communication
- **Authentication**: Session management with user authentication

## Getting Started

To run this project locally, follow these steps:

### Prerequisites
Before you begin, make sure you have the following software installed on your computer:

- **Node.js**: You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Comes bundled with Node.js.

### Installation
1. Clone the repository to your local machine using Git:

    ```bash
    git clone https://github.com/yashwanthreddy1408/OnlineCodeEditor.git
    ```

2. Navigate to the project's directory:

    ```bash
    cd OnlineCodeEditor
    ```

3. Install the required dependencies:

    ```bash
    npm install
    ```

### Running the Project
1. Start the application:

    ```bash
    npm start
    ```

2. Open your web browser and go to [http://localhost:3000](http://localhost:3000).

### Usage
- You can now use the online code editor to write, test, and debug Python, JavaScript, and C++ code within your browser.
- You can also log in to save and access your code snippets.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Acknowledgements
- **CodeMirror**: Used for in-browser code editing with syntax highlighting.
- **Socket.io**: Enables real-time communication for collaborative editing.
- **Express.js**: Framework for routing and server-side functionality.

function runCode() {
    var editor = document.getElementById("editor");
    var input = document.getElementById("input").value;
    var code = editor.value;

    // Create a FormData object
    var formData = new FormData();
    formData.append("code", code);
    formData.append("input", input);

    // Send a POST request to a server-side script (PHP or another server-side language)
    fetch('execute.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById("output").textContent = data;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

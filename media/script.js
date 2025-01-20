const vscode = acquireVsCodeApi();

document.getElementById('submitButton').addEventListener('click', () => {
    const url = document.getElementById('urlInput').value;
    if (url) {
        vscode.postMessage({ command: 'submitUrl', url: url });
    } else {
        document.getElementById('errorMessage').textContent = 'Please enter a URL.';
    }
});

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'displayProblem':
            document.getElementById('problemDescription').textContent = message.content;
            break;
        case 'error':
            document.getElementById('errorMessage').textContent = message.message;
            break;
    }
});

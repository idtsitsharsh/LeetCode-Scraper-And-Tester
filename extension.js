const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { scrapeLeetCodeProblem } = require('./scraper'); // Import the scraper function
const { runCppTests, runPythonTests } = require('./run_tests');

function activate(context) {
	// extensionPath = context.extensionPath;
    let disposable = vscode.commands.registerCommand('extension.scrapeLeetCode', async () => {
        console.log('Command triggered: extension.scrapeLeetCode');

        // Create a new Webview Panel
        const panel = vscode.window.createWebviewPanel(
            'leetCodeScraper', // Identifies the type of the webview
            'LeetCode Scraper', // Title of the webview
            vscode.ViewColumn.One, // Show the webview in the first column
            {
                enableScripts: true, // Allow JavaScript in the webview
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))], // Allow access to the media folder
            }
        );

        // Get the HTML content by reading the external HTML file
        const htmlContent = getWebviewContent(context.extensionPath, panel);

        // Set the HTML content for the webview
        panel.webview.html = htmlContent;

        // Listen for messages from the webview
        panel.webview.onDidReceiveMessage(async message => {
            switch (message.command) {
                case 'submitUrl':
                    const url = message.url;
                    if (url) {
                        console.log('Entered URL:', url);
                        try {
                            // Call the scraper function with the URL provided by the user
                            const result = await scrapeLeetCodeProblem(url);
                            if (result) {
                                // Send the content of problem_description.txt back to the webview
                                const problemDescription = await getProblemDescription();
                                panel.webview.postMessage({ command: 'displayProblem', content: problemDescription });
                            }
                        } catch (error) {
                            panel.webview.postMessage({ command: 'error', message: 'Error scraping the problem.' });
                            console.error(error);
                        }
                    } else {
                        panel.webview.postMessage({ command: 'error', message: 'No URL provided.' });
                    }
                    return;
				case 'testCode':
					const tempFilePath = path.join(__dirname, 'tempCodeFile');
					const { code, language } = message;
	
					// Write the code to a temporary file
					const extension = language === 'cpp' ? '.cpp' : '.py';
					const filePath = tempFilePath + extension;
					fs.writeFileSync(filePath, code);
					
					let testResult;
					try {
						if (language === 'cpp') {
							const testCppCode = async () => {
								const testResult = await runCppTests("tempCodeFile.cpp");
								try {
									await panel.webview.postMessage({
										command: 'testResult',
										result: testResult,
									});
									console.log("hey");
									console.log(testResult);  // Now testResult will have the correct value after waiting for the function to complete
								} catch (error) {
									console.error('Error running C++ tests:', error);
								}
							};
							
							// Call the function to start the tests
							testCppCode();
							
						} else if (language === 'python') {
							testResult = runPythonTests(".\\tempCodeFile.py");
						}
						
						
					} catch (error) {
						testResult = `Error running tests: ${error.message}`;
					} finally {
						// Delete the temporary file
						// fs.unlinkSync(filePath);
					}
	
					
					break;
            }
        });
    });

    context.subscriptions.push(disposable);
    console.log('LeetCode Scraper extension activated!');
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};

// Function to get the HTML content for the webview
function getWebviewContent(extensionPath, panel) {
	
    // Ensure extensionPath is a string
	console.log(extensionPath);
    if (typeof extensionPath !== 'string') {
        vscode.window.showErrorMessage('Invalid extension path');
        return '';
    }

    // Correctly reference the CSS and JS files in the media folder
    const scriptUri = vscode.Uri.file(path.join(extensionPath, 'media', 'script.js'));
    const styleUri = vscode.Uri.file(path.join(extensionPath, 'media', 'styles.css'));

    // Convert the URIs to webview-compatible paths
    const scriptSrc = panel.webview.asWebviewUri(scriptUri).toString();
    const styleSrc = panel.webview.asWebviewUri(styleUri).toString();
    // Read the HTML content from the webview.html file
    const htmlUri = vscode.Uri.file(path.join(extensionPath, 'media', 'webview.html'));
    const htmlContent = fs.readFileSync(htmlUri.fsPath, 'utf8');
	console.log(scriptSrc);
	// return htmlContent;
    // Return the HTML content with the correct paths for the resources
    return htmlContent.replace(
        /<script src=""><\/script>/,
        `<script src="${scriptSrc}"></script>`
    ).replace(
        /<link rel="stylesheet" href="" id="styleLink">/,
        `<link rel="stylesheet" href="${styleSrc}" id="styleLink" />`
    );
}

// Function to get the content of the problem_description.txt file
async function getProblemDescription() {
    const fs = require('fs');
    const path = require('path');
    const problemFolder = path.join(__dirname, 'LeetCodeProblem');
    const problemDescriptionFile = path.join(problemFolder, 'problem_description.txt');
    return new Promise((resolve, reject) => {
        fs.readFile(problemDescriptionFile, 'utf8', (err, data) => {
            if (err) {
                reject('Error reading problem description.');
            } else {
                resolve(data);
            }
        });
    });
}

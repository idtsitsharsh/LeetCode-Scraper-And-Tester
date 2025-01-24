const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { scrapeLeetCodeProblem } = require('./scraper');
const { runCppTests, runPythonTests } = require('./run_tests');

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.scrapeLeetCode', async () => {
        console.log('Command triggered: extension.scrapeLeetCode');
        const panel = vscode.window.createWebviewPanel(
            'leetCodeScraper', 
            'LeetCode Scraper',
            vscode.ViewColumn.One, 
            {
                enableScripts: true, 
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))], 
            }
        );
        const htmlContent = getWebviewContent(context.extensionPath, panel);
        panel.webview.html = htmlContent;
        panel.webview.onDidReceiveMessage(async message => {
            switch (message.command) {
                case 'submitUrl':
                    const url = message.url;
                    if (url) {
                        console.log('Entered URL:', url);
                        try {
                            const result = await scrapeLeetCodeProblem(url);
                            if (result) {
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
					const extension = language === 'cpp' ? '.cpp' : '.py';
					const filePath = tempFilePath + extension;
				
					try {
						fs.writeFileSync(filePath, code);
						console.log(`File written successfully: ${filePath}`);
				
						const waitForFile = (filePath) => {
							return new Promise((resolve, reject) => {
								const interval = setInterval(() => {
									if (fs.existsSync(filePath)) {
										clearInterval(interval);
										resolve();
									}
								}, 50); 
								setTimeout(() => {
									clearInterval(interval);
									reject(new Error(`File ${filePath} not found within timeout`));
								}, 5000);
							});
						};
				
						waitForFile(filePath).then(async () => {
							if (language === 'cpp') {
								const testCppCode = async () => {
									try {
										const testResult = await runCppTests("tempCodeFile.cpp");
										await panel.webview.postMessage({
											command: 'testResult',
											result: testResult,
										});
										console.log(testResult);
									} catch (error) {
										console.error('Error running C++ tests:', error);
									}
								};
				
								testCppCode();
							} else if (language === 'python') {
								const testPythonCode = async () => {
									try {
										const testResult = await runPythonTests("tempCodeFile.py");
										await panel.webview.postMessage({
											command: 'testResult',
											result: testResult,
										});
										console.log(testResult);
									} catch (error) {
										console.error('Error running Python tests:', error);
									}
								};
				
								testPythonCode();
							}
						}).catch((error) => {
							console.error(`Error waiting for file to exist: ${error.message}`);
						});
				
					} catch (error) {
						console.log(`Error writing file or running tests: ${error.message}`);
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

function getWebviewContent(extensionPath, panel) {
	console.log(extensionPath);
    if (typeof extensionPath !== 'string') {
        vscode.window.showErrorMessage('Invalid extension path');
        return '';
    }
    // const scriptUri = vscode.Uri.file(path.join(extensionPath, 'media', 'script.js'));
    // const styleUri = vscode.Uri.file(path.join(extensionPath, 'media', 'styles.css'));
    // const scriptSrc = panel.webview.asWebviewUri(scriptUri).toString();
    // const styleSrc = panel.webview.asWebviewUri(styleUri).toString();
    const htmlUri = vscode.Uri.file(path.join(extensionPath, 'media', 'webview.html'));
    const htmlContent = fs.readFileSync(htmlUri.fsPath, 'utf8');
	// console.log(scriptSrc);
	// return htmlContent;
    // Return the HTML content with the correct paths for the resources
    return htmlContent;
}

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

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path'); 

const readInput = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

const readExpectedOutput = (filePath) => {
  return fs.readFileSync(filePath, 'utf8').trim(); 
};

const runPythonTests = (pythonSourceFile) => {
    return new Promise((resolve, reject) => {
        try {
            const leetCodeProblemsDir = path.join(__dirname, 'LeetCodeProblem');
            const inputFiles = fs.readdirSync(leetCodeProblemsDir).filter(file => file.startsWith('input_') && file.endsWith('.txt'));
            console.log('Found input files:', inputFiles);

            const testCases = inputFiles.map(inputFile => {
                const testCaseNumber = inputFile.match(/\d+/)[0]; 
                const expectedOutputFile = `output_${testCaseNumber}.txt`;

                const inputFilePath = path.join(leetCodeProblemsDir, inputFile);
                const expectedOutputFilePath = path.join(leetCodeProblemsDir, expectedOutputFile);

                return { inputFilePath, expectedOutputFilePath, testCaseNumber };
            });

            let output = '';
            const runTestCases = async () => {
                for (const { inputFilePath, expectedOutputFilePath, testCaseNumber } of testCases) {
                    if (!fs.existsSync(expectedOutputFilePath)) {
                        console.error(`Expected output file ${expectedOutputFilePath} is missing.`);
                        continue;
                    }
                    const input = fs.readFileSync(inputFilePath, 'utf-8').trim();
                    const expectedOutput = fs.readFileSync(expectedOutputFilePath, 'utf-8').trim();
                    const tempInputFile = 'temp_input.txt';
                    fs.writeFileSync(tempInputFile, input);
                    pythonSourceFile = path.join(__dirname, 'tempCodeFile.py');
                    const executeCommand = `cmd /c "python "${pythonSourceFile}" < ${tempInputFile}"`;
                    try {
                        const actualOutput = await new Promise((resolve, reject) => {
                            exec(executeCommand, (execErr, execStdout, execStderr) => {
                                if (execErr || execStderr) {
                                    reject(execErr || execStderr);
                                    return;
                                }
                                resolve(execStdout.trim());
                            });
                        });
                        if (actualOutput === expectedOutput) {
                            output += `Test case ${testCaseNumber} passed.\n`;
                        } else {
                            output += `Test case ${testCaseNumber} failed.\n`;
                            output += `Expected: ${expectedOutput}\n`;
                            output += `Got: ${actualOutput}\n`;
                        }
                        console.log(output);
                    } catch (error) {
                        console.error(`Error executing test case ${testCaseNumber}:`, error);
                    } finally {
                        fs.unlinkSync(tempInputFile);
                    }
                }

                const result = output;
                console.log(output);
                resolve(result);
            };

            runTestCases();
        } catch (error) {
            reject(error);
        }
    });
};

const runCppTests = (cppSourceFile) => {
    return new Promise((resolve, reject) => {
        try {
            const leetCodeProblemsDir = path.join(__dirname, 'LeetCodeProblem');
            const inputFiles = fs.readdirSync(leetCodeProblemsDir).filter(file => file.startsWith('input_') && file.endsWith('.txt'));
            cppSourceFile = path.join(__dirname, 'tempCodeFile.cpp');
            const compileCommand = `g++ "${cppSourceFile}" -o tempCodeFile.exe`;
            exec(compileCommand, (compileErr, compileStdout, compileStderr) => {
                if (compileErr) {
                    return `Error compiling C++ code:', ${compileErr.message}`;
                }
                if (compileStderr) {
                    return `Compile stderr:', ${compileStderr}`;
                }

            console.log('Compilation successful.');
            const testCases = inputFiles.map(inputFile => {
                const testCaseNumber = inputFile.match(/\d+/)[0];
                const expectedOutputFile = `output_${testCaseNumber}.txt`;

                const inputFilePath = path.join(leetCodeProblemsDir, inputFile);
                const expectedOutputFilePath = path.join(leetCodeProblemsDir, expectedOutputFile);

                return { inputFilePath, expectedOutputFilePath, testCaseNumber };
            });
            let output='';
            const runTestCases = async () => {
                for (const { inputFilePath, expectedOutputFilePath, testCaseNumber } of testCases) {
                    if (!fs.existsSync(expectedOutputFilePath)) {
                        console.error(`Expected output file ${expectedOutputFilePath} is missing.`);
                        continue;
                    }

                    const input = fs.readFileSync(inputFilePath, 'utf-8').trim();
                    const expectedOutput = fs.readFileSync(expectedOutputFilePath, 'utf-8').trim();
                    const tempInputFile = 'temp_input.txt';
                    fs.writeFileSync(tempInputFile, input);
                    const executeCommand = `cmd /c "tempCodeFile.exe < ${tempInputFile}"`; 
                    try {
                        const actualOutput = await new Promise((resolve, reject) => {
                            exec(executeCommand, (execErr, execStdout, execStderr) => {
                                if (execErr || execStderr) {
                                    reject(execErr || execStderr);
                                    return;
                                }
                                resolve(execStdout.trim());
                            });
                        });
                        if (actualOutput === expectedOutput) {
                            output+=`Test case ${testCaseNumber} passed.\n`;
                        } else {
                            output+=`Test case ${testCaseNumber} failed.\n`;
                            output+=`Expected: ${expectedOutput}\n`;
                            output+=`Got: ${actualOutput}\n`;
                            console.log(output);
                            
                        }
                        
                    } catch (error) {
                        console.error(`Error executing test case ${testCaseNumber}:`, error);
                    } finally {                   
                        fs.unlinkSync(tempInputFile);
                    }
                }
                const result = output;
                console.log(output);
                resolve(result);
                try {
                    console.log('Cleaned up executable.');
                } catch (err) {
                    console.error('Error deleting executable:', err.message);
                }
            };

            runTestCases();
        });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { runCppTests, runPythonTests };

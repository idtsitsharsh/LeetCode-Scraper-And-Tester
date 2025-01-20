const fs = require('fs');
const { exec } = require('child_process');
const path = require('path'); // Use this module to handle file paths

// Function to read input from file
const readInput = (filePath) => {
  return fs.readFileSync(filePath, 'utf8');
};

// Function to read expected output from file
const readExpectedOutput = (filePath) => {
  return fs.readFileSync(filePath, 'utf8').trim(); // Trim to remove any extra newlines or spaces
};

// Function to execute Python code and compare output
const runPythonTests = (pythonSourceFile) => {
    // Define the directory where the files are located
    const leetCodeProblemsDir = path.join('D:', 'Webd Code', 'Tinkering Lab', 'LeetCodeProblem');

    // Get all input files in the directory
    const inputFiles = fs.readdirSync(leetCodeProblemsDir).filter(file => file.startsWith('input_') && file.endsWith('.txt'));

    // Step 1: Iterate through all input files and test
    const testCases = inputFiles.map(inputFile => {
        const testCaseNumber = inputFile.match(/\d+/)[0]; // Extract test case number
        const expectedOutputFile = `output_${testCaseNumber}.txt`;

        const inputFilePath = path.join(leetCodeProblemsDir, inputFile);
        const expectedOutputFilePath = path.join(leetCodeProblemsDir, expectedOutputFile);

        return { inputFilePath, expectedOutputFilePath, testCaseNumber };
    });

    const runTestCases = async () => {
        for (const { inputFilePath, expectedOutputFilePath, testCaseNumber } of testCases) {
            if (!fs.existsSync(expectedOutputFilePath)) {
                console.error(`Expected output file ${expectedOutputFilePath} is missing.`);
                break;
            }

            const input = readInput(inputFilePath);
            const expectedOutput = readInput(expectedOutputFilePath);

            // Write input to a temporary file
            fs.writeFileSync('temp_input.txt', input);

            // Execute the Python script with input redirection
            const executeCommand = `python ${pythonSourceFile} < temp_input.txt`;
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

                // Compare the output with the expected output
                if (actualOutput === expectedOutput) {
                    return `Test case ${testCaseNumber} passed.`;
                } else {
                    return `Test case ${testCaseNumber} failed. Expected: ${expectedOutput}, but got: ${actualOutput}`;
                }
            } catch (error) {
                console.error(`Error executing test case ${testCaseNumber}:`, error);
                break;
            } finally {
                // Clean up the temporary input file
                fs.unlinkSync('temp_input.txt');
            }
        }

        // Step 2: No need to delete anything for Python as there’s no executable to delete
    };

    runTestCases();
};

const runCppTests = (cppSourceFile) => {
    return new Promise((resolve, reject) => {
        try {
    // Define the directory where the files are located
    const leetCodeProblemsDir = path.join('D:', 'Webd Code', 'Tinkering Lab', 'leetcodescraper', 'LeetCodeProblem');
    // Get all input files in the directory
    const inputFiles = fs.readdirSync(leetCodeProblemsDir).filter(file => file.startsWith('input_') && file.endsWith('.txt'));
    // Step 1: Compile the C++ source file
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

        // Step 2: Iterate through all input files and test
        const testCases = inputFiles.map(inputFile => {
            const testCaseNumber = inputFile.match(/\d+/)[0]; // Extract test case number
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

                // Write input to a temporary file
                const tempInputFile = 'temp_input.txt';
                fs.writeFileSync(tempInputFile, input);

                // Execute the compiled executable with input redirection
                const executeCommand = `cmd /c "tempCodeFile.exe < ${tempInputFile}"`; // Windows-specific command
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

                    // Compare the output with the expected output
                    if (actualOutput === expectedOutput) {
                        output+=`Test case ${testCaseNumber} passed.\n`;
                    } else {
                        output+=`Test case ${testCaseNumber} failed.\n`;
                        output+=`Expected: ${expectedOutput}\n`;
                        output+=`Got: ${actualOutput}\n`;
                        console.log(output);
                        const result = output;
                        resolve(result);
                    }
                } catch (error) {
                    console.error(`Error executing test case ${testCaseNumber}:`, error);
                } finally {
                    // Clean up the temporary input file
                    fs.unlinkSync(tempInputFile);
                }
            }

            // Step 3: Delete the executable file after all tests
            try {
                // fs.unlinkSync('tempCodeFile.exe');
                console.log('Cleaned up executable.');
            } catch (err) {
                console.error('Error deleting executable:', err.message);
            }
        };

        runTestCases();
    });
    } catch (error) {
        reject(error);  // Reject the promise if there's an error
    }
    });
};


module.exports = { runCppTests, runPythonTests };

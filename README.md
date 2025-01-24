# LeetCode Scraper Extension  

## Overview  
The **LeetCode Scraper Extension** is a Visual Studio Code extension that simplifies solving LeetCode problems directly within the editor. With an integrated UI for better visualization, this extension allows users to:  

1. Enter a LeetCode problem URL.  
2. Scrape and display the problem statement using Puppeteer.  
3. Write and submit solutions in **C++** or **Python**.  
4. View test case results, including failed test cases, to refine solutions.  

This extension is ideal for developers who want to streamline their problem-solving workflow without switching between the browser and the editor.  

---

## Features  

- **Integrated UI**:  
  - A text box to input the LeetCode problem URL.  
  - Displays the problem statement directly in the editor.  

- **Solution Editor**:  
  - Write your solution on the right-hand side of the UI.  
  - Support for **C++** and **Python** programming languages.  

- **Code Submission**:  
  - Submit your code directly from the extension.  
  - Receive feedback on test case results, including details of failed cases.  

---

## Installation  

1. Clone the repository:  
   ```bash  
   git clone https://github.com/your-username/leetcode-scraper-extension.git  
   ```  

2. Open the project in Visual Studio Code.  

3. Install dependencies:  
   ```bash  
   npm install  
   ```  

4. Run the extension in a development environment:  
   - Press `F5` in VS Code to launch a new Extension Development Host window.  

---

## Usage  

1. Open the **LeetCode Scraper** extension from the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and select `Scrape LeetCode Problem`.  

2. Enter the URL of the LeetCode problem in the provided text box and click **Submit**.  

3. The problem statement will appear on the left side of the UI.  

4. Write your solution in the editor on the right-hand side.  

5. Click **Submit Code** to test your solution.  

6. View the results, including details of failed test cases, to debug and refine your solution.  

---

## Prerequisites  

- **Node.js**: Ensure you have Node.js installed to manage dependencies.  
- **Puppeteer**: Puppeteer is used for web scraping. It will automatically be installed as a dependency.  
- **VS Code Extension Development**: Familiarity with VS Code extension development is helpful but not required.  

---

## Technologies Used  

- **Visual Studio Code API**: For building the extension and integrating the webview.  
- **Puppeteer**: For scraping LeetCode problem statements.  
- **HTML, CSS, and JavaScript**: For the webview UI.  
- **C++ and Python**: Supported languages for submitting solutions.  

---

## Folder Structure  

```
project-root/  
│  
├── media/  
│   └── webview.html        # HTML content for the webview  
│  
├── LeetCodeProblem/        # Folder to store scraped problem data  
│   └── problem_description.txt  
│  
├── scraper.js              # Puppeteer-based scraper logic  
├── extension.js            # Main extension logic  
├── package.json            # Extension metadata and dependencies  
└── README.md               # Project documentation  
```  

---

## Future Enhancements  

- Add support for more programming languages.  
- Implement a feature to save solutions locally or sync with GitHub.  
- Improve error handling for invalid URLs or scraping issues.  
- Add a dark mode for the UI.  

---

## Contribution  

Contributions are welcome! If you’d like to contribute:  

1. Fork the repository.  
2. Create a feature branch:  
   ```bash  
   git checkout -b feature-name  
   ```  
3. Commit your changes:  
   ```bash  
   git commit -m "Add feature-name"  
   ```  
4. Push to the branch:  
   ```bash  
   git push origin feature-name  
   ```  
5. Open a pull request.  

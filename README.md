# Loki - A Lightweight Version Control System

Loki is a simple version control system designed to manage and track changes to files in your project. It offers essential features like initialization, adding files, committing changes, viewing commit logs, and showing differences between commits.

## Prerequisites

- Node.js (version 14 or higher)

## Installation

1. Clone the repository:
    ```bash
    git clone <repository_url>
    ```
2. Navigate to the project directory:
    ```bash
    cd loki
    ```
3. Make the script executable:
    ```bash
    chmod +x loki
    ```
4. Ensure you have the necessary dependencies:
    ```bash
    npm install
    ```

## Usage

You can use the following commands with Loki:

### Initialize a Loki Repository

Initialize an empty Loki repository in the current directory:
```bash
./loki init
Add Files to the Index
Add a file to the staging area:

bash
./loki add <file>
Commit Changes
Commit the staged files with a commit message:

bash
./loki commit <message>
View Commit Logs

Display the commit history:

bash
./loki log
Show Differences Between Commits
Show the differences between the current commit and the previous commit:

bash
./loki diff
Project Structure
.loki: The directory where all Loki files are stored.
objects: Contains all the objects (files and commits).
HEAD: Contains the reference to the current branch.
index: Contains the staged files.
Example
bash
# Initialize a new Loki repository
./loki init

# Add a file to the staging area
./loki add example.txt

# Commit the changes
./loki commit "Initial commit"

# View the commit log
./loki log

# Show the differences between the current commit and the previous commit
./loki diff
Contributing
Feel free to submit issues and pull requests. For major changes, please open an issue first to discuss what you would like to change.
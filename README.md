# HOW TO USE AL-FOLIO WEBSITE

## Installation

The website is developed and served locally using WSL2, Docker, and Docker Compose.

### 1. Install WSL2 and Ubuntu

Install WSL2 and an Ubuntu distribution from Windows Store. After installation, open the **Ubuntu/WSL terminal**. From this point onward, development commands should normally be run there.

### 2. Install Docker Desktop

Install Docker Desktop for Windows and enable WSL integration for the Ubuntu distribution.

Docker Desktop provides the Docker Engine used by the project. You do not need to install Ruby, Bundler, or Jekyll directly in WSL.

Docker Desktop itself is configured from **Windows**, but Docker commands are run from the **WSL/Ubuntu terminal**.

### 3. Install Git and Node.js/npm

Run the following commands in the **WSL/Ubuntu terminal**:

```bash
sudo apt update
sudo apt install git
sudo apt install nodejs npm
```

Verify the installation:

```bash
which node
which npm
node --version
npm --version
```

`node` and `npm` should resolve to paths under `/usr/bin/`.

If the shell has previously resolved a Windows installation of npm, run:

```bash
hash -r
```

Then check again:

```bash
which npm
```

### 4. Clone the repository

All of the following commands are run in the **WSL/Ubuntu terminal**.

Move to the desired directory:

```bash
cd ~
```

Clone the repository:

```bash
git clone https://github.com/LucaMartinoia/lucamartinoia.github.io.git
```

Enter the repository:

```bash
cd ~/lucamartinoia.github.io
```

From now on, commands referring to the website should be run from this repository directory unless stated otherwise.

### 5. Install JavaScript dependencies

Run this in the **WSL/Ubuntu terminal**, from the repository root:

```bash
npm install
```

These dependencies are used for formatting, static checks, and browser-based tests.

Jekyll, Ruby, and Bundler are provided by Docker and do not need to be installed directly in WSL.

## Local usage

### Start the website

Run this in the **WSL/Ubuntu terminal**, from the repository root:

```bash
docker compose up
```

Docker starts the Jekyll container and serves the website at:

http://localhost:8080

To run Docker in the background:

```bash
docker compose up -d
```

Check the container status:

```bash
docker compose ps
```

Stop the containers:

```bash
docker compose down
```

All of these are **Docker commands issued from WSL**. They are not commands that need to be run inside the container.

### Enter the Docker container

If you need to work directly inside the Jekyll container, first make sure it is running:

```bash
docker compose up -d
```

Then, from **WSL/Ubuntu**:

```bash
docker compose exec jekyll /bin/bash
```

You are now inside the Docker container.

The command prompt will change, and commands such as `bundle` and `jekyll` can now be executed directly.

For example:

```bash
bundle exec jekyll build --baseurl /lucamartinoia.github.io
```

To leave the container:

```bash
exit
```

### Build the website

Normally, you do not need to build the Docker image yourself. The preferred approach is to pull the latest project image and start the container:

```bash
docker compose pull
docker compose up
```

There are also two equivalent ways to run a Jekyll build. From **WSL/Ubuntu**, without manually entering the container:

```bash
docker compose exec jekyll bundle exec jekyll build --baseurl /lucamartinoia.github.io
```

Or enter the container first:

```bash
docker compose exec jekyll /bin/bash
```

and then run inside the **Docker container**:

```bash
bundle exec jekyll build --baseurl /lucamartinoia.github.io
```

The first form is usually more convenient.

## Tests

There are two main types of tests.

Node-based checks are run directly in **WSL/Ubuntu**.

Jekyll and integration tests are run in the **Docker container**. They can normally be invoked from WSL using `docker compose exec`.

### Formatting and static checks

Run these from **WSL/Ubuntu**, in the repository root:

```bash
npm run lint:prettier
```

To automatically format the repository:

```bash
npm run lint:prettier -- --write
```

Run the al-folio style contract:

```bash
npm run lint:style-contract
```

These commands use the Node.js installation in WSL.

### Integration tests

First make sure the Docker container is running. Run this in **WSL/Ubuntu**:

```bash
docker compose up -d
```

Then run the tests from **WSL/Ubuntu** using `docker compose exec`:

```bash
docker compose exec jekyll bash test/integration_plugin_toggles.sh
```

```bash
docker compose exec jekyll bash test/integration_bootstrap_compat.sh
```

```bash
docker compose exec jekyll bash test/integration_css_minify.sh
```

Here, `docker compose exec jekyll` means:

> Execute the following command inside the running `jekyll` Docker container.

Therefore, the actual test scripts run inside Docker even though the command itself is typed in WSL.

The equivalent procedure, after entering the container manually, is:

```bash
bash test/integration_plugin_toggles.sh
bash test/integration_bootstrap_compat.sh
bash test/integration_css_minify.sh
```

Some integration tests supplied by al-folio are only applicable when the corresponding feature is used by this website. For example, the comments and Distill integration tests are not relevant if those features are not present.

### Visual tests

Playwright is a Node-based test system, so these commands are run from **WSL/Ubuntu**, in the repository root.

Install the required browsers if necessary:

```bash
npx playwright install chromium webkit
```

Then run:

```bash
npm run test:visual
```

## Sync with GitHub

Git commands are run in the **WSL/Ubuntu terminal**, from the repository root.

Before committing, format the repository:

```bash
npm run lint:prettier -- --write
```

Check what changed:

```bash
git status
```

Add the changes:

```bash
git add --all
```

Create a commit:

```bash
git commit -m "Description of changes"
```

Push to GitHub:

```bash
git push
```

GitHub Pages will then build and deploy the updated website. Deployment normally takes several minutes.

If the local branch is out of sync with GitHub:

```bash
git fetch --all
```

Then inspect the branch status and resolve any required merge or rebase before pushing.

## Quick reference

| Command type                     | Where it runs                        |
| -------------------------------- | ------------------------------------ |
| `git ...`                        | WSL/Ubuntu                           |
| `npm ...`                        | WSL/Ubuntu                           |
| `node ...`                       | WSL/Ubuntu                           |
| `npx ...`                        | WSL/Ubuntu                           |
| `docker compose ...`             | WSL/Ubuntu                           |
| `bundle ...`                     | Docker container                     |
| `jekyll ...`                     | Docker container                     |
| `bash test/integration_*.sh`     | Docker container                     |
| `docker compose exec jekyll ...` | Typed in WSL, executed inside Docker |

The most common workflow is therefore:

**WSL/Ubuntu → `npm` / `git` / `docker compose`**

**Docker container → `bundle` / `jekyll` / integration tests**

# Local changes

This is a list of local changes performed compared to the pure al-folio version:
- Added `_includes/head.liquid` to overwrite the same file from the al-folio-core plugin. This was necessary in order to include `blob` in the Content Security Policy that was blocking Three.js.

## TODO:

3. Check the correct way to apply social icon color and how to add icons to the CV
4. Add the new simulation to the website
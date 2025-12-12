# HOW TO USE AL-FOLIO WEBSITE

## Installation

- Install WSL2 and Ubuntu (https://ubuntu.com/tutorials/install-ubuntu-on-wsl2-on-windows-11-with-gui-support).
- Install Docker Windows and enable WSL integration.
- Install Git on Ubuntu and sync the GitHub account.
- Open Ubuntu and go in the desired directory
- Clone the template from my own repository

      $ git clone https://github.com/LucaMartinoia/lucamartinoia.github.io.git

## Local usage

- Move in the cloned folder

      $ cd/LucaMartinoia.github.io

- Install dependencies with

      npm install

- Use Docker

      $ sudo docker compose pull
      $ docker compose up

- If problem arise:

      $ docker compose build --no-cache
      $ docker compose up

- The local version of the website if found at http://localhost:8080
- To quit Docker, `CTRL+C`

## Sync with GitHub server

Done with the changes, update the server

- First, use prettier in the directory

      $ npx prettier . --write

-     	$ git add --all

  to add all changes to the commit.

-     	$ git commit -m "msg"

  to commit the changes.

-     	$ git push

  to send the commit to the GitHub repository.

- Wait 5/10 min for the files to be loaded and processed by Pages' Actions.
- If pushing raises issues, it might be necessary to

      $ git fetch --all

  first, to sync the server with the local version.

## Useful links

- Favicon: https://emojipedia.org/
- Tabelle e immagini: https://getbootstrap.com/docs/4.4/layout/grid/

## Main changes:

- Social icons colors: `assets/css/main.scss`
- Icons in ersume: `_includes/resume/work.liquid` (and education)
- Multi-tag publications: `_pages/publications`

## TO DO

- EISNET

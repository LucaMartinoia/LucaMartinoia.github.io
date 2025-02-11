### HOW TO USE AL-FOLIO WEBSITE ###
- Installare WSL2 e Ubuntu dai canali ufficiali (https://ubuntu.com/tutorials/install-ubuntu-on-wsl2-on-windows-11-with-gui-support).
- Installare Docker (https://dev.to/0xkoji/install-docker-on-wsl2-2ma5) e Git su Ubuntu.

- Usare ubuntu terminal e spostarsi nella cartella desiderata (comando "cd directory")
- $ git clone https://github.com/LucaMartinoia/lucamartinoia.github.io.git [da fare solo una volta]
- Spostarsi nella cartella appena clonata "cd/LucaMartinoia.github.io"
- Usare comandi Docker per creare build
	$ sudo docker compose pull [password luca92]
	$ docker compose up
	
	SE DA' PROBLEMI, PROVARE (ChatGPT):
	- Provare prima a ribuildare i volumi:
		$ sudo docker compose down --volumes
		$ sudo docker compose up --build
	- Remove Gemfile.lock and Rebuild:	If Gemfile.lock is potentially causing conflicts, try deleting it on your local machine and then running:
		$ rm Gemfile.lock
		$ touch Gemfile.lock
		$ sudo docker compose up --build

- Il sito, in forma locale, si trova su	http://localhost:8080
- Le modifiche fatte ai file, via e.g. notepad++, vengono implementate immediatamente dal sistema (dopo qualche secondo, il tempo di buildare)
- Per uscire, CTRL+C

- Fatte tutte le modifiche, aggiornare il server (https://www.earthdatascience.org/workshops/intro-version-control-git/basic-git-commands/)
	- Nella directory del repository: $ git add --all per aggiungere i file modificati a una lista
	- Successivamente $ git commit -m *msg* per trasformare la lista in un commit da mandare a github
	- Per mandare definitivamente i file su GitHub, usare $ git push (chiede username e password)
	- Aspettare 5/10 min che i file vengano prima caricati, poi processati dal workflow automatizzato del server di Pages.
	
	- Se $ git push dà problemi, potrebbe essere necessario un $ git fetch --all. Probabilmente perché ho cambiato qualche file sul server e quindi git pensa che la versione locale non sia correttamente sincronizzata.


LINK UTILI:
 - Favicon: https://emojipedia.org/
 - Tabelle e immagini: https://getbootstrap.com/docs/4.4/layout/grid/
 
 
 MODIFICHE DIFFICILI:
 - Colore delle icone social: assets/css/main.scss
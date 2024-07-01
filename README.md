### HOW TO USE AL-FOLIO WEBSITE ###
- Installare WSL2 e Ubuntu dai canali ufficiali (https://ubuntu.com/tutorials/install-ubuntu-on-wsl2-on-windows-11-with-gui-support).
- Installare Docker (https://dev.to/0xkoji/install-docker-on-wsl2-2ma5) e Git su Ubuntu.

- Usare ubuntu terminal e spostarsi nella cartella desiderata (comando "cd directory")
- $ git clone https://github.com/LucaMartinoia/lucamartinoia.github.io.git [da fare solo una volta]
- Spostarsi nella cartella appena clonata "LucaMartinoia.github.io"
- Usare comandi Docker per creare build
	$ sudo docker compose pull
	$ docker compose up

- Il sito, in forma locale, si trova su	http://localhost:8080
- Le modifiche fatte ai file, via e.g. notepad++, vengono implementate immediatamente dal sistema (dopo qualche secondo, il tempo di buildare)
- Per uscire, CTRL+C

- Fatte tutte le modifiche, in qualche modo, capire come fare il push sul server.


LINK UTILI:
 - Favicon: https://emojipedia.org/
 - Tabelle e immagini: https://getbootstrap.com/docs/4.4/layout/grid/
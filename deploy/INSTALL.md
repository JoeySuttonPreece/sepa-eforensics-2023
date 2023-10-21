# Installation Instructions
AEAS is distributed as a zip file containing all the necessary shortcuts, scripts and binaries needed to run the program.

Before installing, please verify that the computer you wish to install AEAS on is running Debian GNU/Linux 12 (bookworm). This can be verified by with the output of the command `cat /etc/os-release`.

1. First, unzip the provided zip folder to any location of your choosing on the system - all files will be copied to a different location after the installation procedure so this initial location does not matter.
2. Open a new terminal to the location where the zip folder was extracted.
3. Ensure that the `install.sh` script is marked as executable, this can be done by running the command `chmod +x install.sh`.
4. Next, run the command `./install.sh`. At this point, the script should install all of AEAS' runtime dependencies and install the program to the appropriate locations on your machine.
5. You should recieve a notification when the installation is complete.

At this point AEAS should be installed on your system, however it may be necessary for you to reboot the machine in order for the application to show up in your desktop environment's "start menu".

The program can be accessed via the command-line with the command `AEAS` (command line switches are also supported) or graphically through your desktop environment, usually under the "system tools" (or similar) menu.

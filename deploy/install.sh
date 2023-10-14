#!/bin/sh
sudo apt install ansible
echo "BECOME password is your sudo password"
ansible-playbook playbook.yaml --ask-become-pass
sudo mkdir -p /opt/AEAS/
sudo cp ElectronReact-4.6.0.AppImage /opt/AEAS/AEAS.AppImage
sudo cp ICON-V1.gif /opt/AEAS/ICON-V1.gif
sudo cp AEAS /usr/bin/AEAS
sudo cp AEAS.desktop /usr/share/applications/AEAS.desktop

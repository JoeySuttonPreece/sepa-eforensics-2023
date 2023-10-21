#!/bin/sh
sudo apt install ansible
sudo ansible-playbook install.yaml
sudo mkdir -p /opt/AEAS/
sudo cp ElectronReact-4.6.0.AppImage /opt/AEAS/AEAS.AppImage
sudo chmod +x /opt/AEAS/AEAS.AppImage
sudo cp ICON-V1.gif /opt/AEAS/ICON-V1.gif
sudo cp AEAS /usr/local/bin/AEAS
sudo chmod +x /usr/local/bin/AEAS
sudo cp AEAS.desktop /usr/local/share/applications/AEAS.desktop
echo "AEAS has been installed"

# Packaging Instructions
1. Before starting, ensure that your local development environment is up to date. In particular that you have run `npm install` recently to ensure all Node dependencies are present
2. Run `npm run package` to build an AppImage of the application. For those that are curious, bundles contains Node.JS as well as Electron's dependencies into a single file
3. Copy the built file from ./release/build/ElectronReact-4.6.0.AppImage to the deploy folder. The install script expects this file to retain the same name as above, so please don't change it

The "deploy" folder should now be ready for distribution. However, please take care to double check that the following items are present within the folder

| File                         | Purpose                                                                                                                                                                                |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AEAS                         | Runner script for the program, it currently just suppresses warning messages                                                                                                           |
| AEAS.desktop                 | Effectively the shortcut to run the program. This is what shows up in the "start menu"                                                                                                 |
| ElectronReact-4.6.0.AppImage | Built version of the program. AppImage is a binary format that contains all the "actual" runtime dependencies (libraries and such). Does not contain any of the CLI tools we use, as these are not seen strictly as dependencies by Linux |
| ICON-V1.gif                  | Icon used for the start "menu" shortcut                                                                                                                                                |
| install.sh                   | Main install script. Copies all of the files here to the appropriate location on the host as well as installs dependencies                                                             |
| install.yaml                 | Ansible playbook used to install runtime dependencies. Handles the installation / building for all the CLI tools used                                                                  |

If all files are present, then the deploy folder can be zipped and distributed

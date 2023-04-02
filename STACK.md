# eForensic Tooling
Writing an eForensics tool from scratch really wasn't in the scope for our project, as it is not practical for such a small and inexperienced team (in that field at least). For this reason we are relying on ***The Sleuth Kit*** for all things eForensics, they provide both a C library and command-line program. For our project we are using the command-line program, as its output is fairly uniform and can be parsed easily by external tools (such as ours) - more on this later. This will provide all the functionality we need for undeleting files, etc.

# Operating System
The Sleuth Kit does work on both Windows and Linux operating systems, however Linux is generally considered the industry standard for eForensics. This is for several reasons, generally speaking it is because accessing the raw data on a disk (helpful for finding deleted files) is trivial - as well as being able to easily force external disks to mount as read-only, maintaining the integrity of digital evidence. As Linux is a fairly broad term that can cover literally thousands of operating systems, it is critical that we target a single operating system to ensure that our software functions correctly in a known environment.

Our chosen operating system is ***Debian 11*** (the current release). Debian is a Linux distribution with a focus on stability, for this reason software packages are rarely updated (often using LTS packages), only commonly receiving bugfixes and other patches. This removes a lot of the issues that we could potentially run into as software developers as the software installed on the system is unlikely to change in any way that will break our software

---

We now have an operating system that can has the necessary software installed to forensically analyse a disk or disk image, the environment will be consistent so we can target specific versions of whatever libraries or software we need and be confident that nothing will break unexpectedly with a software update.

---

# Programming Language
As previously mentioned, TSK does provide a C library that implements all of the functionality, however C is not a nice language to write in. There is also an implementation of the C library in Python, which is a nice language to write in.

One key thing that came up in our discussions was how we were going to implement a GUI for a Python app, very few of the team members had experience writing GUI apps. So while the Python library for TSK was very convenient, the GUI (likely the key feature that will set our software apart from others), would be 'basic' to say the least.

Another option is to use another programming language and instead of relying on the C library, writing our own wrapper around TSK's command-line interface. This comes with a few key advantages.
1. Error handling for the most part is already handled, when dealing with C code, there is a almost guaranteed chance that the program will crash if error handling is not done correctly. Using the CLI ensures that we wont need to deal with any of these errors.
2. It gives as a much greater amount of languages to choose from, as they only need to be able run a command-line program, and grab the output from that. This means we can pick a language that people are more comfortable using, and critically, comfortable writing a GUI for.
3. The underlying TSK 'library' (the functions we create to perform certain actions), will be relatively slim, containing much easier to understand code that we can know exactly what goes in and what comes out

To play into the strengths of our team the chosen language is ***NodeJS 18.15.0 LTS*** using ***Electron*** for the GUI.

In terms of development, this means that NodeJS handles all of the interactions with TSK (running the commands we need, and grabbing all the output data), this is then passed to the Electron web interface, which is bundled nicely as a desktop app. This means that we are using JavaScript to write the functional part of the app (the algorithms, etc.) while being able to use HTML/CSS to format the front end, leading to much more flexibility in terms of UI design.

User clicks \<button\> to get hash of image -> tells Node to call TSK command to get hash of image -> TSK prints hash to standard output (normally terminal but redirected to NodeJS) -> Node passes string back to HTML UI where it is written to the DOM.

# Development Environment
Now we have everything we need to write the program, but there is still one thing to be addressed, "how the hell am I going to write software for Linux on my Windows/MacOS machine?". The obvious answer is to spin up a Debian virtual machine. However, consider the tasks needed to get the machine prepped to run the software. Install NodeJS, install TSK, install NodeJS libraries for Electron. And then what if we decide to add another library to the mix? Every member of the development team needs to go into their VM and install the exact library, and ensure that each installation of the library behaves consistently (there can be a number of ways to install things, some requiring differences in implementation in the software).

Distributing a known VM image is possible, however VMs are heavy, and also just a bit difficult to work with for development. This is where ***Docker*** comes in.

Docker is a container engine, containers are like super lightweight virtual machines, designed to run a single application. Each container is defined by an image, this is the operating system that the container runs - however, unlike VMs, the image can be be described using a Dockerfile. This can define specific versions of software to install, meaning that 2 images compiled with the same Dockerfile will have exactly the same software stack.

One of Docker's key limitations is that it was designed for server infrastructure, to keep different microservices isolated from one another, while only requiring a single machine. This means that by default, it is not configured to display any sort of graphics.

To get around this, we can use a docker-compose.yaml (or some command line arguments) to tell the container some directories we would like to share with the container from our host. Due to Linux treating almost everything as a file, this means we can share the X11 windowing socket, tricking our Docker container into thinking that it has a display hooked up, where it will actually display windows on our host machine, as that's where the socket is located.

Using this shared directory system, we can also pass source code from our machine to the container for it to run, this means that we can completely blow away the container, include new libraries, and re-run our up-to-date code in the container - without the hassle of cloning new code from within the development environment.

# Deployment / Final Testing
Not something that we need to think about too much yet, but final testing should be completed in a VM. Once all the software is finalised, there is little advantage to using a container. A VM will provide a more accurate experience to using the software on 'real hardware', and any final quirks can be ironed out here.

---

# Summary
| Requirement             	| Technology      	| Why                                                                                                                	|
|-------------------------	|-----------------	|--------------------------------------------------------------------------------------------------------------------	|
| Disk Analsys            	| The Sleuth Kit  	| Don't want to reinvent the wheel for this complex eForensics stuff                                                 	|
| Operating System        	| Debian 11       	| Stable, Linux is industry standard, packages aren't going to introduce breaking changes                            	|
| Programming Language    	| NodeJS/Electron 	| Everyone is confident in this, UI is easy to make look nice, can call TSK command-line and parse / wrap the output 	|
| Development Environment 	| Docker          	| Lightweight, image is defined from known inputs, can display a GUI (with some trickery)                            	|
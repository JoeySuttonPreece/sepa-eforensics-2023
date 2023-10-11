# Documentation

## Zip

In the SystemTestImage.zip is a dd file named MyTestImage.zip
this image contains system folders and user data, so that timeline and timezone can be collected.

## Files

In addition to the files included in the MyTestImage for the previous file, there are other files that were created while a user was logged, the expectation is that the original files should not have a user associated in a timeline, but the following will

### System Files

#### /home/harry/.bash_history

contians the user history of commands

- 'sudo nano harrysecret.jpeg',
- 'sudo nano exfiltrated.txt',
- 'sudo cp exfiltrated.txt hidden.doc',
- 'sudo rm exfiltrated.txt',

#### /var/log/wtmp

contaons the log on and log of times

#### /etc/timezone

contains the timezone

### renamed files

/home/harry/files/harrysecret.jpeg (actually a text file)
hidden.doc (actually exfiltrated.txt)

### deleted files

/home/harry/exfiltrated.txt

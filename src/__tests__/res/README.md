# MyTestImage.zip
This file contains the following:
1. MyTestImage.dd
2. md5sum.txt

[2] contains the MD5 hash for [1].

[1] has the following output for MMLS (mmls MyTestImage.dd):

DOS Partition Table
Offset Sector: 0
Units are in 512-byte sectors

      Slot      Start        End          Length       Description
000:  Meta      0000000000   0000000000   0000000001   Primary Table (#0)
001:  -------   0000000000   0000000127   0000000128   Unallocated
002:  000:000   0000000128   0000016511   0000016384   DOS FAT12 (0x01)
003:  000:001   0000016512   0000082047   0000065536   DOS FAT16 (0x06)
004:  000:002   0000082048   0000213119   0000131072   Win95 FAT32 (0x0b)
005:  -------   0000213120   0002097152   0001884033   Unallocated

# Win95 Parition
In the Win95 partition, we have the following files (from FLS) (fls -o 82048 MyTestImage.dd):

r/r 3:  32FAT       (Volume Label Entry)
r/r 5:  Algol.txt
r/r * 7:        Bellatrix.txt
r/r 9:  Canopus.txt
d/d 12: TestDirectory1
v/v 1966083:    $MBR
v/v 1966084:    $FAT1
v/v 1966085:    $FAT2
V/V 1966086:    $OrphanFiles

In the TestDirectory1 (from FLS) (fls -o 82048 MyTestImage.dd 12):

r/r 103:        MyNormalTestFile.txt
r/r * 105:      ziJTpZhK
r/r 108:        MyRenamedTestFile.txt
r/r * 111:      MyCarvedTestFile.txt
r/r * 114:      MyCarvedTestFile.zip

# Files
In MyNormalTestFile.txt, we have 'Hello Test!'

MyRenamedTestFile.txt is a JPEG file, which has been renamed to .txt.

We had a file, MyDeletedTestFile.txt, with the text 'This file will be deleted.' This file was deleted. Currently, we can't see the file 
in the directory - we do, however, see a strange entry at inode 105, 'ziJTpZhK', which we did not place here. It is our assumption that this 
strange entry represents our MyDeletedTestFile.txt.

MyCarvedTestFile.zip should contain MyCarvedTestFile.txt (this was created first, then zipped into the zip), and both have been deleted.

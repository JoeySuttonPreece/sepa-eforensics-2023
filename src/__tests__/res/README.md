# Documentation
The zip file contains two files:
1. MyTestImage.dd
2. md5sum.txt

[2] contains the MD5 hash of [1].

The image MyTestImage.dd contains the directory MyDirectory. The files in this directory correspond to the files in the directory test-files (in this repo).

## Command: mmls MyTestImage.dd
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

## Command: fls -o 82048 MyTestImage.dd 
r/r 3:  32FAT       (Volume Label Entry)
r/r 5:  Algol.txt
d/d 7:  MyDirectory
r/r 9:  Canopus.txt
v/v 1966083:    $MBR
v/v 1966084:    $FAT1
v/v 1966085:    $FAT2
V/V 1966086:    $OrphanFiles

## Command: fls -o 82048 MyTestImage.dd 7
r/r 102:        MyNormal.txt
r/r 104:        MyRenamed.txt
r/r 107:        MyOverwrite1.txt
r/r * 110:      MyDeleted2.txt

## Command: istat -o 82048 MyTestImage.dd 102
Directory Entry: 102
Allocated
File Attributes: File, Archive
Size: 1050
Name: MYNORMAL.TXT

Directory Entry Times:
Written:        2023-09-05 11:33:54 (AEST)
Accessed:       2023-09-05 00:00:00 (AEST)
Created:        2023-09-05 11:33:55 (AEST)

Sectors:
8199 8200 8201

## Command: istat -o 82048 MyTestImage.dd 104
Directory Entry: 104
Allocated
File Attributes: File, Archive
Size: 7168
Name: MYRENA~1.TXT

Directory Entry Times:
Written:        2023-09-05 11:33:58 (AEST)
Accessed:       2023-09-05 00:00:00 (AEST)
Created:        2023-09-05 11:33:59 (AEST)

Sectors:
8202 8203 8204 8205 8206 8207 8208 8209
8210 8211 8212 8213 8214 8215

## Command: istat -o 82048 MyTestImage.dd 107
Directory Entry: 107
Allocated
File Attributes: File, Archive
Size: 641
Name: MYOVER~1.TXT

Directory Entry Times:
Written:        2023-09-05 11:35:10 (AEST)
Accessed:       2023-09-05 00:00:00 (AEST)
Created:        2023-09-05 11:35:10 (AEST)

Sectors:
8219 8220

## Command: istat -o 82048 MyTestImage.dd 110
Directory Entry: 110
Not Allocated
File Attributes: File, Archive
Size: 1054
Name: _YDELE~1.TXT

Directory Entry Times:
Written:        2023-09-05 11:38:12 (AEST)
Accessed:       2023-09-05 00:00:00 (AEST)
Created:        2023-09-05 11:38:12 (AEST)

Sectors:
8221 8222 8223

## Command: strings -t d MyTestImage.dd | grep 'deleted 1'
46215168 This file will be deleted 1.

Here we do some math: 
(46215168 - (partition start sector in bytes)) / sector size in bytes
= (46215168 - (82048*512)) / 512
= 8216

##  blkcat -o 82048 MyTestImage.dd 8216 -h
0       54686973 2066696c 65207769 6c6c2062     This  fil e wi ll b
16      65206465 6c657465 6420312e 0d0a4242     e de lete d 1. ..BB
32      42424242 42424242 42424242 42424242     BBBB BBBB BBBB BBBB
48      42424242 42424242 42424242 42424242     BBBB BBBB BBBB BBBB
(continued.)

The file takes up the sectors 8216, 8217, 8218.

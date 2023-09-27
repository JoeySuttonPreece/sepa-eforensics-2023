import '@testing-library/jest-dom';
import { buildTimeline, getUserOnTime } from 'domain/timeline-tools';
import { File } from 'domain/file-system-tools';

jest.mock('../../domain/runner', () => {
  return {
    runCliTool: jest
      .fn()
      .mockImplementationOnce(
        async () =>
          'd/d 11: lost+found\nd/d 1572865:    etc\nd/d 7077889:    media\nd/d 5505025:    home\nl/l 14: lib\nd/d 3407873:    mnt\nd/d 3145729:    usr\nd/d 5898241:    var'
      )
      .mockImplementationOnce(
        async () =>
          'd/d 5900627:    backups\nd/d 5900630:    lib\nd/d 5900631:    local\nd/d 5900633:    log\nl/l 5900636:    run\nd/d 5900639:    tmp\nd/d 5900812:    www'
      )
      .mockImplementationOnce(
        async () =>
          'd/d 6033895:    gdm3\nd/d 6042781:    unattended-upgrades\nr/r 5900931:    alternatives.log\nr/r 5901172:    btmp\nr/r 5900935:    faillog\nr/r 5900937:    lastlog\nr/r 5900938:    wtmp\nd/d 6029343:    installer'
      )
      .mockImplementationOnce(
        async () =>
          'harry    :0           :0               Fri Sep  8 12:15:07 2023   still logged in\nreboot   system boot  5.15.0-58-generi Fri Sep  8 12:14:39 2023   still running\nharry    :1           :1               Thu Sep  7 18:34:31 2023 - crash                     (17:40)\nharry    pts/0        192.168.1.103    Wed Sep  6 13:54:15 2023 - Wed Sep  6 18:06:44 2023  (04:12)\nharry    pts/0        192.168.1.103    Wed Sep  6 08:45:12 2023 - Wed Sep  6 12:06:17 2023  (03:21)\nharry    pts/0        192.168.1.103    Tue Sep  5 10:15:46 2023 - Tue Sep  5 10:33:49 2023  (00:18)\nharry    pts/1        192.168.1.103    Wed Aug  9 17:48:53 2023 - Wed Aug  9 23:01:43 2023  (05:12)\nharry    pts/0        192.168.1.103    Wed Aug  9 17:29:03 2023 - Wed Aug  9 17:48:39 2023  (00:19)\nreboot   system boot  5.15.0-58-generi Wed Aug  9 17:26:24 2023   still running\nharry    pts/1        192.168.1.103    Mon Jul 24 19:56:46 2023 - Mon Jul 24 22:32:14 2023  (02:35)\nharry    pts/1        192.168.1.103    Mon Jul 24 17:04:39 2023 - Mon Jul 24 19:48:24 2023  (02:43)\nharry    pts/1        192.168.1.103    Fri Jul  7 13:38:59 2023 - Fri Jul  7 16:21:45 2023  (02:42)'
      )
      .mockImplementationOnce(
        async () =>
          'd/d 11: lost+found\nd/d 1572865:    etc\nd/d 7077889:    media\nd/d 5505025:    home\nl/l 14: lib\nd/d 3407873:    mnt\nd/d 3145729:    usr\nd/d 5898241:    var'
      )
      .mockImplementationOnce(async () => 'd/d 5521807:    harry')
      .mockImplementationOnce(
        async () =>
          'd/d 5505090:    Documents\nd/d 5505091:    Music\nd/d 5505092:    Pictures\nd/d 5505093:    Videos\nd/d 5505353:    .mozilla\nr/r 5508099:    .sudo_as_admin_successful\nr/r 5522727:    .bash_history\nr/r 5508293:    .bashrc_backup\nd/d 5509505:    .cisco'
      )
      .mockImplementationOnce(
        async () =>
          'last\nls\ncd Documents\nnano deletedfile.txt\nls\nmv PangeaUltimaMap.png defintleynotrenamed.txt\nls\nnano keyword.txt\nrm deletedfile.txt\ndf'
      ),
  };
});

const files: File[] = [
  {
    inode: '143',
    fileName: '/home/harry/defintleynotrenamed.txt',
    fileNameFileType: '',
    metadataFileType: '',
    deleted: false,
    reallocated: false,
    crtime: '',
    atime: new Date(),
    ctime: new Date(),
    mtime: new Date('2023-09-05 10:19:06 '),
    size: 64,
    uid: '',
    gid: '',
    hash: '',
  },
  {
    inode: '143',
    fileName: '/home/harry/keyword.txt',
    fileNameFileType: '',
    metadataFileType: '',
    deleted: false,
    reallocated: false,
    crtime: '',
    atime: new Date(),
    ctime: new Date(),
    mtime: new Date('2023-09-05 10:20:52'),
    size: 64,
    uid: '',
    gid: '',
    hash: '',
  },
  {
    inode: '143',
    fileName: '/home/harry/deletedfile.txt',
    fileNameFileType: '',
    metadataFileType: '',
    deleted: false,
    reallocated: false,
    crtime: '',
    atime: new Date(),
    ctime: new Date(),
    mtime: new Date('2023-09-05 10:20:52'),
    size: 64,
    uid: '',
    gid: '',
    hash: '',
  },
  {
    inode: '143',
    fileName: '/home/harry/secretfile.txt',
    fileNameFileType: '',
    metadataFileType: '',
    deleted: false,
    reallocated: false,
    crtime: '',
    atime: new Date(),
    ctime: new Date(),
    mtime: new Date('2021-09-05 10:20:52'),
    size: 64,
    uid: '',
    gid: '',
    hash: '',
  },
];

test('Build Timeline', async () => {
  let output = await buildTimeline(
    files,
    { start: 63, end: 100, length: 37, description: '' },
    ''
  );

  expect(output[0].operations.length).toBe(0);
  expect(output[1].suspectedUsers[0].name).toBe('harry');
  expect(output[1].operations[0].command).toBe(
    'mv PangeaUltimaMap.png defintleynotrenamed.txt'
  );
  expect(output[3].operations.length).toBe(2);
});

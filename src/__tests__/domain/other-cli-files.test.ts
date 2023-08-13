import '@testing-library/jest-dom';
import { getMD5HashAsync } from '../../main/domain/other-cli-tools';
import { DownloaderHelper } from 'node-downloader-helper';
import { exec } from 'child_process';
import util, { callbackify } from 'node:util';

const promisifiedExec = util.promisify(exec);

const downloadFolder: string = `${__dirname}`;
const fileName = 'test.E01';
const downloadedFilePath = `${downloadFolder}/${fileName}`;

afterAll(async () => {
  const { stdout, stderr } = await promisifiedExec(`rm ${downloadedFilePath}`);
  console.log(stdout);
});

test('Test getMD5HashAsync works with E01.', async () => {
  const url: string =
    'https://digitalcorpora.s3.amazonaws.com/corpora/drives/nps-2009-casper-rw/ubnist1.casper-rw.gen0.E01';

  // Download to this folder

  const dl = new DownloaderHelper(url, downloadFolder, {
    fileName: fileName,
  });

  dl.on('end', async () => {
    console.log('Done');
    console.log(`Downloaded to ${downloadFolder}`);

    let md5Hash = '';

    const { stdout, stderr } = await promisifiedExec(
      `md5sum ${downloadedFilePath}`
    );

    md5Hash = stdout;

    const data = await getMD5HashAsync(downloadedFilePath);

    expect(data).toBe(md5Hash);
  });

  await dl.start();
}, 60000);

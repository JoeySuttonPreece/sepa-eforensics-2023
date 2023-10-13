import util from 'node:util';
import '@testing-library/jest-dom';
import { exec } from 'child_process';
import download from 'download';
import { Hash } from 'domain/file-system-tools';
import { getHashAsync } from '../../domain/other-cli-tools';

const promisifiedExec = util.promisify(exec);

const downloadFolder: string = `${__dirname}`;
const fileName = 'test.E01';
const downloadedFilePath = `${downloadFolder}/${fileName}`;

afterAll(async () => {
  const { stdout } = await promisifiedExec(`rm ${downloadedFilePath}`);
  console.log(stdout);
});

test('hash works with E01.', async () => {
  const url: string =
    'https://digitalcorpora.s3.amazonaws.com/corpora/drives/nps-2009-casper-rw/ubnist1.casper-rw.gen0.E01';

  // Download to this folder

  await download(url, downloadFolder, {
    filename: fileName,
  });

  console.log('Done');
  console.log(`Downloaded to ${downloadFolder}`);

  let expectedMD5Hash = '';

  const { stdout } = await promisifiedExec(`md5sum ${downloadedFilePath}`);

  expectedMD5Hash = stdout;

  const actualHash: Hash = await getHashAsync(downloadedFilePath);

  expect(actualHash.md5sum).toBe(expectedMD5Hash);
}, 60000);

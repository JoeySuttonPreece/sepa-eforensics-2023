import '@testing-library/jest-dom';
import { getMD5HashAsync } from '../../app-core/domain/other-cli-tools';
import download from 'download';
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

  await download(url, downloadFolder, {
    filename: fileName,
  });

  console.log('Done');
  console.log(`Downloaded to ${downloadFolder}`);

  let data = '';
  let md5Hash = '';

  const { stdout, stderr } = await promisifiedExec(
    `md5sum ${downloadedFilePath}`
  );

  md5Hash = stdout;

  data = await getMD5HashAsync(downloadedFilePath);

  expect(data).toBe(md5Hash);
}, 60000);

//////////////////////////////////////////////////
function download(callback: () => void) {
  // some download
  // once finsihed:
  callback();
}

function callback() {
  console.log('this is inside the callback.');
}

download(callback);
//////////////////////////////////////////////////

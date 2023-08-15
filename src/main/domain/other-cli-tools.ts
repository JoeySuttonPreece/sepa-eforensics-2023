import { runCliTool } from './runner';

async function getMD5HashAsync(filePath: string): Promise<string> {
  let output: any = '';

  output = await runCliTool(`md5sum ${filePath}`);

  return output.stdout;
}

export { getMD5HashAsync };

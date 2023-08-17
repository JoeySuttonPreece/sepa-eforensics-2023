import '@testing-library/jest-dom';
import { runBufferedCliTool } from '../../domain/runner';

function lineProcessor(line: string): string[] {
  return line.split(' ');
}

test('DEBUG: RUN FUNCTION', async () => {  
  let output = await runBufferedCliTool('ls -la /', lineProcessor);
  console.log(output)
}, 60000);

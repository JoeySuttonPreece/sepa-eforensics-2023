import { ipcMain } from 'electron';
import { orchestrator } from '../domain/orchestrator';

ipcMain.on('do-everything', async (event, [options]) => {
  // insert loading while orchestrator is going, this means we can't await,
  // perhaps a callback is put into orchestrator to define what it should do??
  const output = await orchestrator(options, (msg) => {
    event.sender.send('status:update', msg);
  });

  // first send event that route should be changed to report then:
  event.sender.send('report:details', output);
});

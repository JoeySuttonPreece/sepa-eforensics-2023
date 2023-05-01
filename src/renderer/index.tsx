import { createRoot } from 'react-dom/client';
import { Partition, PartitionTable } from '../main/sleuthkit/volume-system-tools'
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.on('volume-system:getPartitions', (object) => {
  let partitionTable: PartitionTable = object;
  document.getElementById('type')!.innerText = partitionTable.type;
  document.getElementById('sectorSize')!.innerText = partitionTable.sectorSize.toString();
  document.getElementById('partitions')!.innerText = `Partitions: 
  ${JSON.stringify(partitionTable.partitions, null, 2)}`;
  for(let i = 0; i < partitionTable.partitions.length; i++) {
    window.electron.ipcRenderer.sendMessage('file-name:listFiles', [ document.getElementById('imagePath').value, partitionTable.partitions[i].start ]) 
  }
});

window.electron.ipcRenderer.on('file-name:listFiles', (object) => {
  console.log(object)
});

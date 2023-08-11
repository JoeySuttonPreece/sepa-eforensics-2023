import { Partition, PartitionTable } from '../main/domain/volume-system-tools'
import { useState } from 'react';
import PartitionTableComponent from './PartitionTable';
import RenamedFilesComponent from './RenamedFiles';
import { RenamedFile } from 'main/domain/file-system-tools';

export default function Hello() {

  const [MD5String, setMD5String] = useState('');
  const [PartitionTableData, setPartitionTableData] = useState<{header: string, partitionTable: PartitionTable | undefined}>({header: "", partitionTable: undefined });
  const [RenamedFilesData, setRenamedFilesData] = useState<{header: string, renamedFiles: RenamedFile[] | undefined}>({header: "", renamedFiles: undefined });

  function getPartitions() {
    let imagePathInput: HTMLInputElement | null = document.getElementById('imagePath') as HTMLInputElement;
    if (imagePathInput == null) return;
    let fileName: string | null = imagePathInput.value;
    if (fileName == '') {
      setPartitionTableData({header: "No Partitions", partitionTable: undefined});
      return;
    }

    window.electron.ipcRenderer.sendMessage('volume-system:getPartitions', [fileName]);
  }

  function getRenamed() {
    //Need to wait for restructure as can't get parameters required from here.
  }
  
  function getMD5Hash() {
    let imagePathInput: HTMLInputElement | null = document.getElementById('imagePath') as HTMLInputElement;
    
    if (imagePathInput == null) return;
    
    let fileName: string | null = imagePathInput.value;

    if (fileName == '') {
      setMD5String('Please specify a file path!');
      return;
    }

    window.electron.ipcRenderer.sendMessage('other-cli:getMD5Hash', [ fileName ]); 
  }
  
  // calling IPC exposed from preload script
  window.electron.ipcRenderer.on('volume-system:getPartitions', (object) => {
    let partitionTable: PartitionTable = object;
    setPartitionTableData({
      header: "Partion Table",
      partitionTable,
  })
    // document.getElementById('type')!.innerText = partitionTable.type;
    // document.getElementById('sectorSize')!.innerText = partitionTable.sectorSize.toString();
    // document.getElementById('partitions')!.innerText = `Partitions: 
    // ${JSON.stringify(partitionTable.partitions, null, 2)}`;
    // for(let i = 0; i < partitionTable.partitions.length; i++) {
    //   window.electron.ipcRenderer.sendMessage('file-name:listFiles', [ document.getElementById('imagePath').value, partitionTable.partitions[i].start ]) 
    // }
  });
  
  window.electron.ipcRenderer.on('file-name:listFiles', (object) => {
    console.log(object)
  });

  window.electron.ipcRenderer.on('other-cli:getMD5Hash', (obj) => {
    setMD5String(obj);
  })

  return (
    <div>
      <input type="text" id="imagePath" />
      <br />
      <button type="button" onClick={getPartitions}>
        Get Disk Partitions
      </button>
      <button type="button" onClick={getMD5Hash}>
        Get MD5 Hash
      </button>
      <br />
      <br />
      <span id="type" />
      <br />
      <span id="sectorSize" />
      <br />
      <span id="partitions" style={{ whiteSpace: 'pre' }}/>
      <br />

      <p>
        {MD5String}
      </p>
      <PartitionTableComponent header={PartitionTableData.header} partitionTable={PartitionTableData.partitionTable}/>
      <RenamedFilesComponent header={RenamedFilesData.header} renamedFiles={RenamedFilesData.renamedFiles}/>
    </div>
  );
} 
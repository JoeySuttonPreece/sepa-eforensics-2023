import { useState } from 'react';
import { File } from '../domain/file-system-tools';
import { PartitionTable } from '../domain/volume-system-tools';
import PartitionTableComponent from './PartitionTable';
import RenamedFilesComponent from './RenamedFiles';
import { OrchestratorOptions } from 'domain/orchestrator';
import ReportComponent from './Report';

export default function Hello() {

///The below logic for retrieving Report Details is now in the report details component using orchestrator

  // const [MD5String, setMD5String] = useState('');

  // const [PartitionTableData, setPartitionTableData] = useState<{
  //   header: string;
  //   partitionTable: PartitionTable | undefined;
  // }>({ header: '', partitionTable: undefined });
  // const [RenamedFilesData, setRenamedFilesData] = useState<{
  //   header: string;
  //   renamedFiles: File[] | undefined;
  // }>({ header: '', renamedFiles: undefined });

  // const [errors, setErrors] = useState('');

  // function getPartitions() {
  //   let imagePathInput: HTMLInputElement | null = document.getElementById(
  //     'imagePath'
  //   ) as HTMLInputElement;
  //   if (imagePathInput == null) return;
  //   let fileName: string | null = imagePathInput.value;
  //   if (fileName == '') {
  //     setPartitionTableData({
  //       header: 'No Partitions',
  //       partitionTable: undefined,
  //     });
  //     return;
  //   }

  //   window.electron.ipcRenderer.sendMessage('volume-system:getPartitions', [
  //     fileName,
  //   ]);
  // }

  // function getRenamed() {
  //   //Need to wait for restructure as can't get parameters required from here.
  // }

  // function getMD5Hash() {
  //   let imagePathInput: HTMLInputElement | null = document.getElementById(
  //     'imagePath'
  //   ) as HTMLInputElement;

  //   if (imagePathInput == null) return;

  //   let filePath: string | null = imagePathInput.value;

  //   if (filePath == '') {
  //     setMD5String('Please specify a file path!');
  //     return;
  //   }

  //   window.electron.ipcRenderer.sendMessage('other-cli:getMD5Hash', [filePath]);
  // }

  // function validateFileType() {
  //   let imagePathInput: HTMLInputElement | null = document.getElementById(
  //     'imagePath'
  //   ) as HTMLInputElement;

  //   let filePath: string | null = imagePathInput.value;

  //   const regex: RegExp = /(\.zip$)|(\.e01$)|(\.dd$)|(\.lef$)|(\.dmg$)/;

  //   try {
  //     if ((filePath as string).search(regex) === -1) {
  //       throw new Error('File type not supported!');
  //     }
  //   } catch (err) {
  //     setErrors('File type not supported');
  //   }
  // }

  // // calling IPC exposed from preload script
  // window.electron.ipcRenderer.on('volume-system:getPartitions', (object) => {
  //   let partitionTable: PartitionTable = object;
  //   setPartitionTableData({
  //     header: 'Partion Table',
  //     partitionTable,
  //   });
  // });

  // window.electron.ipcRenderer.on('file-name:listFiles', (object) => {
  //   console.log(object);
  // });

  // window.electron.ipcRenderer.on('other-cli:getMD5Hash', (obj: string) => {
  //   setMD5String(obj);
  // });

  function handleStartAnalysis() {
    let settings = getOrchestratorOptions();
    if(settings){
      window.electron.ipcRenderer.sendMessage('do-everything', [settings])
    }
   
  }

  function getOrchestratorOptions() : OrchestratorOptions | undefined {
    let imagePathInput: HTMLInputElement | null = document.getElementById(
      'imagePath'
    ) as HTMLInputElement;
    if (imagePathInput == null || imagePathInput.value.trim() == "") return undefined;
    let imagePath: string = imagePathInput.value;
    
    return {imagePath, 
      output:{ //the below will need to actually be processed
        partitions: true,
        renamedFiles: true,
        deletedFiles: true,
        keywordFiles: true,
    }}
  }


  return (
    <div>
      <input type="text" id="imagePath" />
      <br />
      <button type="button" onClick={handleStartAnalysis}>GO!</button>

      <ReportComponent/> {/* this is here for now for testing until routing is setup at which Report component should be its own route */}

      {/* <button type="button" onClick={getPartitions}>
        Get Disk Partitions
      </button>
      <button type="button" onClick={getMD5Hash}>
        Get MD5 Hash
      </button>
      <button type="button" onClick={validateFileType}>
        Validate File Type
      </button> */}
      {/* <div id="Errors">{errors}</div>
      <br />
      <br />
      <span id="type" />
      <br />
      <span id="sectorSize" />
      <br />
      <span id="partitions" style={{ whiteSpace: 'pre' }} />
      <br /> */}

      {/* <p>{MD5String}</p>
      <PartitionTableComponent
        header={PartitionTableData.header}
        partitionTable={PartitionTableData.partitionTable}
      />
      <RenamedFilesComponent
        header={RenamedFilesData.header}
        renamedFiles={RenamedFilesData.renamedFiles}
      /> */}
    </div>
  );
}

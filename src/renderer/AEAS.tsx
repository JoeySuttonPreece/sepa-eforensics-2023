import { useNavigate } from 'react-router-dom';
import { OrchestratorOptions } from 'domain/orchestrator';
import { useRef, useState } from 'react';

export default function AEASComponent() {
  const navigate = useNavigate();
  const [imageValid, setImageValid] = useState(false);
  const [tipMsg, setTipMsg] = useState('');

  const imagePathInput = useRef<HTMLInputElement>(null);
  const partitionInput = useRef<HTMLInputElement>(null);
  const deletedInput = useRef<HTMLInputElement>(null);
  const renamedInput = useRef<HTMLInputElement>(null);
  const carvedInput = useRef<HTMLInputElement>(null);
  const timelineInput = useRef<HTMLInputElement>(null);
  const keywordInput = useRef<HTMLTextAreaElement>(null);

  function handleStartAnalysis() {
    const settings = getOrchestratorOptions();
    if (settings) {
      window.electron.ipcRenderer.sendMessage('do-everything', [settings]);
      navigate('/report');
    }
  }

  function getOrchestratorOptions(): OrchestratorOptions | undefined {
    const imagePath = imagePathInput.current?.value;
    if (!imageValid || imagePath == null) {
      setTipMsg(`Unable to analyse the image at ${imagePath}`);
      return;
    }
    let partitions = partitionInput.current?.checked ?? false;
    let deletedFiles = deletedInput.current?.checked ?? false;
    let renamedFiles = renamedInput.current?.checked ?? false;
    let carvedFiles = carvedInput.current?.checked ?? false;
    let timeline = timelineInput.current?.checked ?? false;
    let searchString = keywordInput.current?.value.trim() ?? '';
    let keywordFiles = searchString !== '';

    return {
      imagePath,
      output: {
        partitions,
        renamedFiles,
        deletedFiles,
        keywordFiles,
        carvedFiles,
        timeline,
      },
      searchString,
    };
  }

  function handleValidateImage(imagePath: string) {
    window.electron.ipcRenderer.once('validate:imagePath', (value) => {
      setImageValid(value);
    });

    window.electron.ipcRenderer.sendMessage('validate:imagePath', [imagePath]);
  }

  return (
    <article id="prepare">
      <section>
        <h2>Select Image</h2>
        <div
          onMouseEnter={() => {
            setTipMsg('Enter Path to the disk image.');
          }}
        >
          <label htmlFor="imagePath"></label>
          <input
            ref={imagePathInput}
            type="text"
            id="imagePath"
            onChange={(e) => {
              handleValidateImage(e.currentTarget.value);
            }}
          />
          <p>
            {imageValid
              ? 'Image ready for analysis'
              : "Image can't be found or is not valid type"}
          </p>
        </div>
      </section>
      <section>
        <h2>Data Collection Options</h2>
        <div
          onMouseEnter={() => {
            setTipMsg(
              'The report will include details of disk partitions in the image including the size and type of the partition.'
            );
          }}
        >
          <input ref={partitionInput} id="partitions" type="checkbox" />
          <label htmlFor="partitions">Partition Details</label>
        </div>
        <div
          onMouseEnter={() => {
            setTipMsg(
              'The report will include details of any recently deleted files that have not yet become unallocated within the disk.'
            );
          }}
        >
          <input ref={deletedInput} id="deleted" type="checkbox" />
          <label htmlFor="deleted">Deleted Files</label>
        </div>
        <div
          onMouseEnter={() => {
            setTipMsg(
              'The report will include details of any files that have had their file extension obfuscated. (e.g. secret.txt -> secret.png)'
            );
          }}
        >
          <input ref={renamedInput} id="renamed" type="checkbox" />
          <label htmlFor="renamed">Renamed Files</label>
        </div>
        <div
          onMouseEnter={() => {
            setTipMsg(
              'The report will include details of any identfied files that remain in the unallocated space of the disk. And will atttempt to identify certain details such as: location, filename, MAC date'
            );
          }}
        >
          <input ref={carvedInput} id="carved" type="checkbox" />
          <label htmlFor="carved">Carved Files</label>
        </div>
        <div
          onMouseEnter={() => {
            setTipMsg(
              'The report will include a timeline built form the modification date of the previously included suspicous file, and will attempt ot attribute a user and suspected operations conducted on the file'
            );
          }}
        >
          <input ref={timelineInput} id="timeline" type="checkbox" />
          <label htmlFor="timeline">File Modification Timeline</label>
        </div>
        <div
          onMouseEnter={() => {
            setTipMsg(
              'List out any keywords you want flagged and if a file has any of the keywords it will be included in the report'
            );
          }}
        >
          <label htmlFor="keywords">Keyword List</label>
          <br />
          <textarea ref={keywordInput} id="keywords" rows={4} cols={50} />
        </div>
      </section>

      <div>
        <button
          type="button"
          onClick={handleStartAnalysis}
          style={{ width: '5em' }}
        >
          GO!
        </button>
      </div>
      <div>{tipMsg}</div>
    </article>
  );
}

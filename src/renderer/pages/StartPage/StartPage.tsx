import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { OrchestratorOptions } from 'domain/orchestrator';
import './StartPage.css';

export default function StartPage() {
  const navigate = useNavigate();
  const [imageValid, setImageValid] = useState(false);
  const [imageStatus, setImageStatus] = useState('enter image path above');
  const [tipMsg, setTipMsg] = useState('');
  const [imagePath, setImagePath] = useState(''); // this is used for the display imagepath in the input box
  // this stores the actual imagePath which is usually the same as the input, but may be different in the case of zip as extraction occurs first
  const imagePathRef = useRef(''); // ref becuase doesn't require reender on change

  const partitionInput = useRef<HTMLInputElement>(null);
  const deletedInput = useRef<HTMLInputElement>(null);
  const renamedInput = useRef<HTMLInputElement>(null);
  const carvedInput = useRef<HTMLInputElement>(null);
  const keepCarvedInput = useRef<HTMLInputElement>(null);
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
    const imagePathValue = imagePathRef.current;
    if (!imagePathValue || imagePathValue == null) {
      setTipMsg(`Unable to analyse the image at ${imagePathValue}`);
      return;
    }

    const showPartitions = partitionInput.current?.checked ?? false;
    const includeDeletedFiles = deletedInput.current?.checked ?? false;
    const includeRenamedFiles = renamedInput.current?.checked ?? false;
    const includeCarvedFiles = carvedInput.current?.checked ?? false;
    const keepRecoveredFiles = keepCarvedInput.current?.checked ?? false;
    const showTimeline = timelineInput.current?.checked ?? false;
    const searchString = keywordInput.current?.value.trim() ?? '';
    const includeKeywordSearchFiles = searchString !== '';

    return {
      imagePath: imagePathValue,
      searchString,
      showPartitions,
      showTimeline,
      includeRenamedFiles,
      includeDeletedFiles,
      includeKeywordSearchFiles,
      includeCarvedFiles,
      keepRecoveredFiles,
    };
  }

  function handleValidateImage(imagePath: string) {
    setImageStatus('awaiting preprocessing');
    window.electron.ipcRenderer.once(
      'validate:imagePath',
      ([valid, finalPath, reason]) => {
        setImageValid(valid);
        imagePathRef.current = finalPath;
        setImageStatus(reason);
      }
    );

    window.electron.ipcRenderer.sendMessage('validate:imagePath', [imagePath]);
  }

  function handleFileSelect() {
    window.electron.ipcRenderer.once('select:imagepath', ([imagePath]) => {
      setImagePath(imagePath);
      handleValidateImage(imagePath);
    });

    window.electron.ipcRenderer.sendMessage('select:imagepath', []);
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
          <input
            type="text"
            id="imagePath"
            value={imagePath}
            onChange={(e) => {
              setImagePath(e.currentTarget.value);
              handleValidateImage(e.currentTarget.value);
            }}
          />
          <button
            type="button"
            onClick={() => {
              handleFileSelect();
            }}
          >
            Select Image
          </button>
          <p>{imageStatus}</p>
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
              'If Carved Files is also selected this will save a copy of the identified file after attempting to carve.'
            );
          }}
        >
          <input ref={keepCarvedInput} id="saveCarved" type="checkbox" />
          <label htmlFor="saveCarved">Save Carved Files</label>
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
              'List out any keywords you want flagged and if a file has any of the keywords it will be included in the report. ' +
                'Remember to separate each keyword with a single comma, and no spaces before or after the comma, for example: ' +
                'keyword1,this is a keyword phrase,keyword 3'
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

import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { type OrchestratorOptions } from 'domain/orchestrator';
import { useLayout } from 'renderer/components/Layout/Layout';
import { ReactComponent as SearchIcon } from '../../../../assets/search.svg';
import styles from './StartPage.scss';

export default function StartPage() {
  const { setStatus, setMenuItems } = useLayout();
  const navigate = useNavigate();
  const [imageValid, setImageValid] = useState(false);
  const [imageStatus, setImageStatus] = useState('');
  const [imagePath, setImagePath] = useState(''); // this is used for the display imagepath in the input box
  // this stores the actual imagePath which is usually the same as the input, but may be different in the case of zip as extraction occurs first
  const imagePathRef = useRef(''); // ref because doesn't require rerender on change

  const partitionInput = useRef<HTMLInputElement>(null);
  const deletedInput = useRef<HTMLInputElement>(null);
  const renamedInput = useRef<HTMLInputElement>(null);
  const carvedInput = useRef<HTMLInputElement>(null);
  const keepKeywordInput = useRef<HTMLInputElement>(null);
  const timelineInput = useRef<HTMLInputElement>(null);
  const keywordInput = useRef<HTMLTextAreaElement>(null);

  function handleStartAnalysis() {
    if (imageValid) {
      const searchString = keywordInput.current?.value?.trim() ?? '';

      const settings: OrchestratorOptions = {
        imagePath: imagePathRef.current,
        searchString,
        showPartitions: partitionInput.current?.checked ?? false,
        showTimeline: timelineInput.current?.checked ?? false,
        includeRenamedFiles: renamedInput.current?.checked ?? false,
        includeDeletedFiles: deletedInput.current?.checked ?? false,
        includeKeywordSearchFiles: searchString !== '',
        includeCarvedFiles: carvedInput.current?.checked ?? false,
        keepKeywordFiles: keepKeywordInput.current?.checked ?? false,
      };

      window.electron.ipcRenderer.sendMessage('do-everything', [settings]);
      navigate('/report');
    } else {
      setStatus(`Unable to analyse the image at ${imagePathRef.current}`);
    }
  }

  function handleValidateImage(path: string) {
    setImageStatus('awaiting preprocessing');
    window.electron.ipcRenderer.once(
      'validate:imagePath',
      ([valid, finalPath, reason]) => {
        setImageValid(valid);
        imagePathRef.current = finalPath;
        setImageStatus(reason);
      }
    );

    window.electron.ipcRenderer.sendMessage('validate:imagePath', [path]);
  }

  function handleFileSelect() {
    window.electron.ipcRenderer.once('select:imagepath', ([path]) => {
      setImagePath(path);
      handleValidateImage(path);
    });

    window.electron.ipcRenderer.sendMessage('select:imagepath', []);
  }

  useEffect(() => {
    setMenuItems({
      left: [],
      right: [
        {
          icon: SearchIcon,
          label: 'GO!',
          action: handleStartAnalysis,
          disabled: !imageValid,
        },
      ],
    });
  }, [imageValid]);

  return (
    <article className={styles.startPage}>
      <section>
        <h2>Select Image</h2>
        <div
          onMouseEnter={() => {
            setStatus('Enter Path to the disk image.');
          }}
        >
          <input
            type="text"
            id="imagePath"
            value={imagePath}
            placeholder="Path to disk image"
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
            Browse...
          </button>
          <p>{imageStatus}</p>
        </div>
      </section>
      <section>
        <h2>Data Collection Options</h2>
        <div
          onMouseEnter={() => {
            setStatus(
              'The report will include details of disk partitions in the image including the size and type of the partition.'
            );
          }}
        >
          <label htmlFor="partitions">
            <input ref={partitionInput} id="partitions" type="checkbox" />
            Partition Details
          </label>
        </div>
        <div
          onMouseEnter={() => {
            setStatus(
              'The report will include details of any recently deleted files that have not yet become unallocated within the disk.'
            );
          }}
        >
          <label htmlFor="deleted">
            <input ref={deletedInput} id="deleted" type="checkbox" />
            Deleted Files
          </label>
        </div>
        <div
          onMouseEnter={() => {
            setStatus(
              'The report will include details of any files that have had their file extension obfuscated. (e.g. secret.txt -> secret.png)'
            );
          }}
        >
          <label htmlFor="renamed">
            <input ref={renamedInput} id="renamed" type="checkbox" />
            Renamed Files
          </label>
        </div>
        <div
          onMouseEnter={() => {
            setStatus(
              'The report will include details of any identified files that remain in the unallocated space of the disk. And will attempt to identify certain details such as: location, filename, MAC date'
            );
          }}
        >
          <label htmlFor="carved">
            <input ref={carvedInput} id="carved" type="checkbox" />
            Carved Files
          </label>
        </div>
        <div
          onMouseEnter={() => {
            setStatus(
              'The report will include a timeline built form the modification date of the previously included suspicious file, and will attempt to attribute a user and suspected operations conducted on the file.'
            );
          }}
        >
          <label htmlFor="timeline">
            <input ref={timelineInput} id="timeline" type="checkbox" />
            File Modification Timeline
          </label>
        </div>
        <div
          onMouseEnter={() => {
            setStatus(
              'The scan will retain any files that contain any of the keywords below.'
            );
          }}
        >
          <label htmlFor="retain">
            <input ref={keepKeywordInput} id="retain" type="checkbox" />
            Keep Keyword Files
          </label>
        </div>
        <div
          onMouseEnter={() => {
            setStatus(
              [
                'List out any keywords you want flagged and if a file has any of the keywords it will be included in the report.',
                'Remember to separate each keyword with a single comma and a space, for example: ',
                'keyword1, this is a keyword phrase, keyword 3',
              ].join('\n')
            );
          }}
        >
          <label htmlFor="keywords">
            Keyword List
            <textarea ref={keywordInput} id="keywords" rows={4} cols={50} />
          </label>
        </div>
      </section>
    </article>
  );
}

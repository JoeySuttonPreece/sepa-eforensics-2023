import { useNavigate } from 'react-router-dom';
import { OrchestratorOptions } from 'domain/orchestrator';
import { useState } from 'react';

export default function AEASComponent() {
  const navigate = useNavigate();
  const [imageValid, setImageValid] = useState(false);

  function handleStartAnalysis() {
    const settings = getOrchestratorOptions();
    if (settings) {
      window.electron.ipcRenderer.sendMessage('do-everything', [settings]);
      navigate('/report');
    }
  }

  function getOrchestratorOptions(): OrchestratorOptions | undefined {
    const imagePathInput: HTMLInputElement | null = document.getElementById(
      'imagePath'
    ) as HTMLInputElement;
    if (imagePathInput == null || imagePathInput.value.trim() == '')
      return undefined;
    const imagePath: string = imagePathInput.value;

    return {
      imagePath,
      output: {
        // the below will need to actually be processed
        partitions: true,
        renamedFiles: true,
        deletedFiles: true,
        keywordFiles: true,
      },
    };
  }

  function handleValidateImage(imagePath: string) {
    window.electron.ipcRenderer.once('validate:imagePath', (value) => {
      setImageValid(value);
    });

    window.electron.ipcRenderer.sendMessage('validate:imagePath', [imagePath]);
  }

  return (
    <article>
      <section>
        <div>
          <label htmlFor="imagePath"></label>
          <input
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
      <section></section>
      <div></div>

      <br />
      <button type="button" onClick={handleStartAnalysis}>
        GO!
      </button>
    </article>
  );
}

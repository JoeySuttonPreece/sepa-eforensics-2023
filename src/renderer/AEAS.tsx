import { useNavigate } from 'react-router-dom';
import { OrchestratorOptions } from 'domain/orchestrator';

export default function AEASComponent() {
  const navigate = useNavigate();

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

  return (
    <article>
      <input type="text" id="imagePath" />
      <br />
      <button type="button" onClick={handleStartAnalysis}>
        GO!
      </button>
    </article>
  );
}

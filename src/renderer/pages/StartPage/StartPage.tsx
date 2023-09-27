import { useNavigate } from 'react-router-dom';
import { OrchestratorOptions } from 'domain/orchestrator';
import './StartPage.css';

export default function StartPage() {
  const navigate = useNavigate();

  function getOrchestratorOptions(): OrchestratorOptions | undefined {
    const imagePathInput: HTMLInputElement | null = document.getElementById(
      'imagePath'
    ) as HTMLInputElement;

    const searchStringInput: HTMLInputElement | null = document.getElementById(
      'imagePath'
    ) as HTMLInputElement;

    if (imagePathInput == null || imagePathInput.value.trim() === '')
      return undefined;

    if (searchStringInput == null || searchStringInput.value.trim() === '')
      return undefined;

    const imagePath: string = imagePathInput.value;
    const searchString: string = searchStringInput.value;

    return {
      imagePath,
      searchString,
      showPartitions: true,
      showTimeline: true,
      includeRenamedFiles: true,
      includeDeletedFiles: true,
      includeKeywordSearchFiles: true,
      includeCarvedFiles: true,
      keepRecoveredFiles: true,
    };
  }

  function handleStartAnalysis() {
    const settings = getOrchestratorOptions();
    if (settings) {
      window.electron.ipcRenderer.sendMessage('do-everything', [settings]);
      navigate('/report');
    }
  }

  return (
    <article className="start-page-content">
      <p>
        Image Path:
        <input type="text" id="imagePath" />
      </p>
      <p>
        Search String:
        <input type="text" id="searchString" />
      </p>
      <button type="button" onClick={handleStartAnalysis}>
        GO!
      </button>
    </article>
  );
}

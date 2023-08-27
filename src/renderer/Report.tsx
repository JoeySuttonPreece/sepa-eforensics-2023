import { useEffect, useState } from 'react';
import { ReportDetails } from 'domain/orchestrator';
import PartitionTableComponent from './PartitionTable';
import RenamedFilesComponent from './RenamedFiles';
import KeywordFilesComponent from './KeywordFiles';
import DeletedFilesComponent from './DeletedFiles';
import './Report.css';

export default function Report() {
  const [details, setDetails] = useState<ReportDetails>();

  useEffect(() => {
    window.electron.ipcRenderer.on(
      'report:details',
      (reportDetails: ReportDetails) => {
        setDetails(reportDetails);
      }
    );
  }, []);

  return (
    <article>
      <header>
        <h1>AEAS Generated Report</h1>
      </header>
      <p>
        <strong>Image:</strong> {details?.imageName}
      </p>
      {details?.partitionTable ? (
        <PartitionTableComponent partitionTable={details.partitionTable} />
      ) : null}
      {details?.keywordFiles ? (
        <KeywordFilesComponent keywordFiles={details.keywordFiles} />
      ) : null}
      {details?.renamedFiles ? (
        <RenamedFilesComponent renamedFiles={details.renamedFiles} />
      ) : null}
      {details?.deletedFiles ? (
        <DeletedFilesComponent deletedFiles={details.deletedFiles} />
      ) : null}
    </article>
  );
}

import { useEffect, useState } from 'react';
import { ReportDetails } from 'domain/orchestrator';
import PartitionTableComponent from './PartitionTable';
import RenamedFilesComponent from './RenamedFiles';
import KeywordFilesComponent from './KeywordFiles';
import DeletedFilesComponent from './DeletedFiles';
import './Report.css';

const ReportComponent = () => {
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
      ) : (
        <></>
      )}
      {details?.keywordFiles ? (
        <KeywordFilesComponent keywordFiles={details.keywordFiles} />
      ) : (
        <></>
      )}
      {details?.renamedFiles ? (
        <RenamedFilesComponent renamedFiles={details.renamedFiles} />
      ) : (
        <></>
      )}
      {details?.deletedFiles ? (
        <DeletedFilesComponent deletedFiles={details.deletedFiles} />
      ) : (
        <></>
      )}
    </article>
  );
};

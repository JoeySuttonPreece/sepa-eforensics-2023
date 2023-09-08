import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportDetails } from 'domain/orchestrator';
import PartitionTableComponent from './components/PartitionTable';
import RenamedFilesComponent from './RenamedFiles';
import KeywordFilesComponent from './components/KeywordFiles';
import DeletedFilesComponent from './components/DeletedFiles';
import './Report.css';
import ImageHashComponent from './components/ImageHash';

export default function ReportComponent() {
  const [reportReady, setReportReady] = useState(false);
  const [message, setMessage] = useState('Finding Image...');
  const [details, setDetails] = useState<ReportDetails>();
  const navigate = useNavigate();

  useEffect(() => {
    window.electron.ipcRenderer.on(
      'report:details',
      (reportDetails: ReportDetails) => {
        setDetails(reportDetails);
        setReportReady(true);
      }
    );
    window.electron.ipcRenderer.on('status:update', (msg) => {
      setMessage(msg);
    });
  }, []);

  function handleReturn() {
    navigate('/');
  }

  return (
    <div>
      <header className="report-header">
        {reportReady ? <button onClick={handleReturn}>Discard</button> : null}
        <h1>AEAS Generated Report</h1>
        {reportReady ? <button>Print</button> : null}
      </header>
      {reportReady ? (
        <article className="report">
          <h3>Image: </h3>
          <p>{details?.imageName}</p>

          {details?.imageHash ? (
            <ImageHashComponent hash={details.imageHash} />
          ) : null}

          <h3>File Info</h3>
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
      ) : (
        <div className="load-view">
          <div>{message}</div>
          <div className="loader" />
        </div>
      )}
    </div>
  );
}

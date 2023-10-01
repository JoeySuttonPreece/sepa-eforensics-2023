import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportDetails } from 'domain/orchestrator';
import TimelineComponent from 'renderer/components/TimelineComponent';
import CarvedFilesComponent from 'renderer/components/CarvedFilesComponent';
import PartitionTableComponent from '../../components/PartitionTableComponent';
import RenamedFilesComponent from '../../components/RenamedFilesComponent';
import KeywordFilesComponent from '../../components/KeywordFilesComponent';
import DeletedFilesComponent from '../../components/DeletedFilesComponent';
import ImageHashComponent from '../../components/ImageHashComponent';
import ErrorMessageComponent from '../../components/ErrorMessageComponent/ErrorMessageComponent';
import PrintButton from './PrintButton';
import './ReportPage.css';

export default function ReportPage() {
  const [reportReady, setReportReady] = useState(false);
  const [message, setMessage] = useState('Finding Image...');
  const [details, setDetails] = useState<ReportDetails>();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.electron.ipcRenderer.on('report:error', (errMsg: string) => {
      setReportReady(false);
      setErrorMsg(errMsg);
    });

    window.electron.ipcRenderer.on(
      'report:details',
      (reportDetails: ReportDetails) => {
        setDetails(reportDetails);
        setReportReady(true);
        console.log(reportDetails);
      }
    );

    window.electron.ipcRenderer.on('status:update', (msg) => {
      setMessage(msg);
    });
  }, []);

  function handleReturn() {
    navigate('/');
  }

  const handlePrint = useCallback((format: string) => {
    window.electron.ipcRenderer.on('select-dir', ([dir]) => {
      if (dir === undefined) return;

      window.electron.ipcRenderer.sendMessage('print', [format, dir]);
    });
    window.electron.ipcRenderer.sendMessage('select-dir', []);
  }, []);

  return (
    <div>
      <header className="report-header">
        {reportReady ? (
          <button type="button" onClick={handleReturn}>
            Discard
          </button>
        ) : null}
        <h1>AEAS Generated Report</h1>
        {reportReady ? <PrintButton onPrint={handlePrint} /> : null}
      </header>

      {errorMsg !== '' ? (
        <div>
          <ErrorMessageComponent errorMessage={errorMsg} />
          <div className="new-report-btn-container">
            <button type="button" onClick={handleReturn}>
              New Report
            </button>
          </div>
        </div>
      ) : null}

      {
        // Check for error message first.
      }

      {errorMsg === '' &&
        (reportReady ? (
          <article className="report">
            <h3>Image: </h3>

            <p>{details?.imageName}</p>

            {details?.imageHash ? (
              <ImageHashComponent hash={details.imageHash} />
            ) : null}

            <h3>File Info</h3>

            {details?.partitionTable ? (
              <PartitionTableComponent
                partitionTable={details.partitionTable}
              />
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
            {details?.carvedFiles ? (
              <CarvedFilesComponent carvedFiles={details.carvedFiles} />
            ) : null}
            {details?.timeline ? (
              <TimelineComponent timeline={details.timeline} />
            ) : null}
          </article>
        ) : (
          <div className="load-view">
            <div>{message}</div>
            <div className="loader" />
          </div>
        ))}
    </div>
  );
}

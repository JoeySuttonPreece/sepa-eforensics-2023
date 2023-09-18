import { useEffect, useState, useRef } from 'react';
import { ReportDetails } from 'domain/orchestrator';
import PartitionTableComponent from './PartitionTable';
import RenamedFilesComponent from './RenamedFiles';
import KeywordFilesComponent from './KeywordFiles';
import DeletedFilesComponent from './DeletedFiles';
import './Report.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { text } from 'stream/consumers';

export default function ReportComponent() {
  const [reportReady, setReportReady] = useState(false);
  const [message, setMessage] = useState('Finding Image...');
  const [details, setDetails] = useState<ReportDetails>();
  const navigate = useNavigate();
  const reportRef = useRef<HTMLElement>(null);

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

  function handlePrint(format: string) {
    window.electron.ipcRenderer.on('select-dir', ([dir]) => {
      if (dir === undefined) return;

      if (format === 'pdf' && reportRef.current !== null) {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.html(reportRef.current, {
          callback: function (doc) {
            window.electron.ipcRenderer.sendMessage('print', [
              format,
              dir,
              doc.output('arraybuffer'),
            ]);
          },
          autoPaging: 'text',
          width: 100,
        });
      }

      window.electron.ipcRenderer.sendMessage('print', [
        format,
        dir,
        reportRef.current,
      ]);
    });
    window.electron.ipcRenderer.sendMessage('select-dir', []);
  }

  return (
    <div>
      <header className="report-header">
        {reportReady ? <button onClick={handleReturn}>Discard</button> : null}
        <h1>AEAS Generated Report</h1>
        {reportReady ? <PrintButton onPrint={handlePrint} /> : null}
      </header>
      {reportReady ? (
        <article ref={reportRef} className="report">
          <p>
            <strong>Image:</strong> {details?.imageName}
          </p>
          <h3>Image Hashes</h3>
          <p>{JSON.stringify(details?.imageHash)}</p>
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

const PrintButton = ({ onPrint }: { onPrint: Function }) => {
  return (
    <div className="dropdown">
      <button>Print</button>
      <div className="dropdown-content">
        <button
          onClick={() => {
            onPrint('pdf');
          }}
        >
          PDF
        </button>
        <button
          onClick={() => {
            onPrint('csv');
          }}
        >
          CSV
        </button>
        <button
          onClick={() => {
            onPrint('json');
          }}
        >
          JSON
        </button>
      </div>
    </div>
  );
};

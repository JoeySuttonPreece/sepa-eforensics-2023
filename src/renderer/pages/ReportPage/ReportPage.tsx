import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classcat from 'classcat';
import { ReportDetails } from 'domain/orchestrator';
import TimelineComponent from 'renderer/components/TimelineComponent/TimelineComponent';
import CarvedFilesComponent from 'renderer/components/CarvedFilesComponent';
import { useLayout } from 'renderer/components/Layout/Layout';
import PartitionTableComponent from '../../components/PartitionTableComponent';
import RenamedFilesComponent from '../../components/RenamedFilesComponent';
import KeywordFilesComponent from '../../components/KeywordFilesComponent';
import DeletedFilesComponent from '../../components/DeletedFilesComponent';
import ErrorMessageComponent from '../../components/ErrorMessageComponent/ErrorMessageComponent';
import { ReactComponent as BackIcon } from '../../../../assets/back.svg';
import { ReactComponent as JsonIcon } from '../../../../assets/json.svg';
import { ReactComponent as CsvIcon } from '../../../../assets/csv.svg';
import { ReactComponent as PdfIcon } from '../../../../assets/pdf.svg';
import styles from './ReportPage.scss';

export default function ReportPage() {
  const { setStatus, setMenuItems } = useLayout();
  const [details, setDetails] = useState<ReportDetails>();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handlePrint = useCallback((format: string) => {
    window.electron.ipcRenderer.on('select-dir', ([dir]) => {
      if (dir === undefined) return;

      window.electron.ipcRenderer.sendMessage('print', [format, dir]);
    });
    window.electron.ipcRenderer.sendMessage('select-dir', []);
  }, []);

  useEffect(() => {
    setMenuItems({
      left: [
        {
          icon: BackIcon,
          label: 'New Report',
          action: () => navigate('/start'),
          disabled: !(details || errorMsg !== ''),
        },
      ],
      right: [
        {
          icon: JsonIcon,
          label: 'Export JSON',
          action: () => handlePrint('json'),
          disabled: !details,
        },
        {
          icon: CsvIcon,
          label: 'Export CSV',
          action: () => handlePrint('csv'),
          disabled: !details,
        },
        {
          icon: PdfIcon,
          label: 'Export PDF',
          disabled: !details,
          action: () => handlePrint('pdf'),
        },
      ],
    });
  }, [setMenuItems, details, errorMsg, navigate, handlePrint]);

  useEffect(() => {
    setStatus('Kicking things into high gear!');
    window.electron.ipcRenderer.on('report:error', (errMsg: string) => {
      setErrorMsg(errMsg);
    });

    window.electron.ipcRenderer.once(
      'report:details',
      (reportDetails: ReportDetails) => {
        setDetails(reportDetails);
        setStatus('Report Complete!');
        console.log(reportDetails);
      }
    );

    window.electron.ipcRenderer.on('status:update', (msg) => {
      setStatus(msg);
    });
  }, []);

  return (
    <article
      className={classcat([
        styles.reportPage,
        { [styles.loaderContainer]: !details },
      ])}
    >
      {errorMsg && <ErrorMessageComponent errorMessage={errorMsg} />}

      {errorMsg === '' &&
        (!details ? (
          <div className={styles.loader} />
        ) : (
          <>
            <h1 className={styles.title}>
              {((str) => str.substring(str.lastIndexOf('/') + 1))(
                details.imageName
              )}
            </h1>
            <div className={styles.subtitle}>
              <span className={styles.bold}>Path: </span>
              {details.imageName}
            </div>
            <div className={styles.subtitle}>
              <div>
                <span className={styles.bold}>MD5: </span>
                {details.imageHash?.md5sum}
              </div>
              <div>
                <span className={styles.bold}>SHA1: </span>
                {details.imageHash?.sha1sum}
              </div>
            </div>

            {(details.imageHash?.md5sum !== details.imageHashFinal?.md5sum ||
              details.imageHash?.sha1sum !==
                details.imageHashFinal?.sha1sum) && (
              <>
                <div>Image integrity compromised. Hashes after processing:</div>
                <div className={styles.subtitle}>
                  <div>
                    <span className={styles.bold}>MD5: </span>
                    {details.imageHash?.md5sum}
                  </div>
                  <div>
                    <span className={styles.bold}>SHA1: </span>
                    {details.imageHash?.sha1sum}
                  </div>
                </div>
              </>
            )}

            <div className={styles.subtitle}>
              <div>
                <span className={styles.bold}>OS Timezone: </span>
                {details.timezone ?? 'Could not Determine Timezone'}
              </div>
            </div>

            {details.partitionTable && (
              <PartitionTableComponent
                partitionTable={details.partitionTable}
              />
            )}
            {details.keywordFiles && (
              <KeywordFilesComponent keywordFiles={details.keywordFiles} />
            )}
            {details.renamedFiles && (
              <RenamedFilesComponent renamedFiles={details.renamedFiles} />
            )}
            {details.deletedFiles && (
              <DeletedFilesComponent deletedFiles={details.deletedFiles} />
            )}
            {details.carvedFiles && (
              <CarvedFilesComponent carvedFiles={details.carvedFiles} />
            )}
            {details.timeline && (
              <TimelineComponent timeline={details.timeline} />
            )}
          </>
        ))}
    </article>
  );
}

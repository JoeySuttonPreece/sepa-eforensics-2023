import { RenamedFile } from '../../domain/file-system-tools';
import styles from '../pages/ReportPage/ReportPage.scss';

function RenamedFilesComponent({
  renamedFiles,
}: {
  renamedFiles: RenamedFile[];
}) {
  return (
    <>
      <h2 className={styles.tableTitle}>Renamed Files</h2>
      <table className={styles.tableSingleHeader}>
        <tbody>
          <tr>
            <th>Inode</th>
            <th>FilePath</th>
            <th>True Ext.</th>
            <th>Size</th>
            <th>MAC Date</th>
            <th>Hash</th>
          </tr>
          {renamedFiles?.map((renamed) => {
            return (
              <tr>
                <td>{renamed.file.inode}</td>
                <td>{renamed.file.fileName}</td>
                <td>
                  {renamed.trueExtensions.map((value) => {
                    return <span>{value} </span>;
                  })}
                </td>
                {/* Check to see whether it knows file size or not */}
                <td>{renamed.file.size}</td>
                <td>
                  {renamed.file.mtime.toLocaleString()}
                  <br />
                  {renamed.file.atime.toLocaleString()}
                  <br />
                  {renamed.file.ctime.toLocaleString()}
                </td>
                <td>{renamed.file.hash.sha1sum}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default RenamedFilesComponent;

import { KeywordFile } from '../../domain/file-system-tools';
import styles from '../pages/ReportPage/ReportPage.scss';

function KeywordFilesComponent({
  keywordFiles,
}: {
  keywordFiles: KeywordFile[];
}) {
  return (
    <>
      <h2 className={styles.tableTitle}>Keyword Matched Files</h2>
      <table className={styles.tableSingleHeader}>
        <tbody>
          <tr>
            <th>Inode</th>
            <th>FilePath</th>
            <th>Keyword(s)</th>
            <th>Match</th>
            <th>Disk Offset (Bytes)</th>
            <th>Size</th>
            <th>MAC Date</th>
            <th>Hash</th>
          </tr>
          {keywordFiles?.map((keywordFile) => {
            return keywordFile.keywordsWithMatches.map((keywordWithMatch) => {
              return keywordWithMatch.matches.map((match) => {
                return (
                  <tr>
                    <td>{keywordFile.inode}</td>
                    <td>{keywordFile.filePath}</td>
                    <td>{keywordWithMatch.keyword}</td>
                    <td>{match.matchedString}</td>
                    <td>{match.offset}</td>
                    <td>{keywordFile.size}</td>
                    <td>
                      {keywordFile.mtime}
                      <br />
                      {keywordFile.atime}
                      <br />
                      {keywordFile.ctime}
                    </td>
                    <td>{keywordFile.hash.sha1sum}</td>
                  </tr>
                );
              });
            });
          })}
        </tbody>
      </table>
    </>
  );
}

export default KeywordFilesComponent;

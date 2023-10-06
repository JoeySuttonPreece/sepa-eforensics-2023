import { KeywordFile } from '../../domain/file-system-tools';

function KeywordFilesComponent({
  keywordFiles,
}: {
  keywordFiles: KeywordFile[];
}) {
  return (
    <table>
      <caption>Keyword Matched Files</caption>
      <tbody>
        <tr>
          <th>Inode</th>
          <th>FilePath</th>
          <th>Keyword Matches</th>
          <th>Size</th>
          <th>MAC Date</th>
          <th>Hash</th>
        </tr>
        {keywordFiles?.map((keyword, index) => {
          return (
            <tr key={index}>
              <td>{keyword.inode}</td>
              <td>{keyword.filePath}</td>
              <td>{keyword.matches}</td>
              <td>{keyword.size}</td>
              <td>
                {keyword.mtime}
                <br />
                {keyword.atime}
                <br />
                {keyword.ctime}
              </td>
              <td>{keyword.hash.sha1sum}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default KeywordFilesComponent;

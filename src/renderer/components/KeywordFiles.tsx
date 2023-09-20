import { KeywordFile } from '../../types/types';

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
              <td>{keyword.file.inode}</td>
              <td>{keyword.file.fileName}</td>
              <td>
                {keyword.matches.map((value: string) => {
                  return <span>{value} </span>;
                })}
              </td>
              <td>{keyword.file.size}</td>
              <td>
                {keyword.file.mtime.toLocaleString()}
                <br />
                {keyword.file.atime.toLocaleString()}
                <br />
                {keyword.file.ctime.toLocaleString()}
              </td>
              <td>{keyword.file.hash.sha1sum}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default KeywordFilesComponent;

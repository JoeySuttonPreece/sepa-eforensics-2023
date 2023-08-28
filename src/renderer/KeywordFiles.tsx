// import {KeywordFile } from "../domain/file-system-tools";
type KeywordFile = any;

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
              <td>
                {keyword.file.mtime}
                <br />
                {keyword.file.atime}
                <br />
                {keyword.file.ctime}
              </td>
              <td>{keyword.file.hash}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default KeywordFilesComponent;

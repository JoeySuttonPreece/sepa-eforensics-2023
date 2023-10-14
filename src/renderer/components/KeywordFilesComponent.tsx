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
          <th>Matched Keyword</th>
          <th>Match</th>
          <th>Match Offset from Beginning of Disk in Bytes</th>
          <th>Size</th>
          <th>MAC Date</th>
          <th>Hash</th>
        </tr>
        {keywordFiles?.map((keywordFile, index) => {
          console.log(keywordFile);

          return keywordFile.keywordsWithMatches.map((keywordWithMatch) => {
            console.log(keywordWithMatch);

            return keywordWithMatch.matches.map((match) => {
              console.log(match);

              return (
                <tr key={index}>
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
  );
}

export default KeywordFilesComponent;

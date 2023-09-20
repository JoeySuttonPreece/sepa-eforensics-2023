import { RenamedFile } from '../../domain/file-system-tools';

function RenamedFilesComponent({
  renamedFiles,
}: {
  renamedFiles: RenamedFile[];
}) {
  return (
    <table>
      <caption>Renamed Files</caption>
      <tbody>
        <tr>
          <th>Inode</th>
          <th>FilePath</th>
          <th>True Ext.</th>
          <th>Size</th>
          <th>MAC Date</th>
          <th>Hash</th>
        </tr>
        {renamedFiles?.map((renamed, index) => {
          return (
            <tr key={index}>
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
  );
}

export default RenamedFilesComponent;

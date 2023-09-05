import { RenamedFile } from '../domain/file-system-tools';

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
                {renamed.file.mtime}
                <br />
                {renamed.file.atime}
                <br />
                {renamed.file.ctime}
              </td>
              <td>{renamed.file.hash}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default RenamedFilesComponent;

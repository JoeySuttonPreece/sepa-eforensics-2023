import { File } from '../../domain/file-system-tools';

function DeletedFilesComponent({ deletedFiles }: { deletedFiles: File[] }) {
  return (
    <table>
      <caption>Deleted Files</caption>
      <tbody>
        <tr>
          <th>Inode</th>
          <th>FilePath</th>
          <th>True Ext.</th>
          <th>Size</th>
          <th>MAC Date</th>
          <th>Hash</th>
        </tr>
        {deletedFiles?.map((deleted, index) => {
          return (
            <tr key={index}>
              <td>{deleted.inode}</td>
              <td>{deleted.fileName}</td>
              <td>{deleted.fileNameFileType}</td>

              {/* size was missing, but not sure to call it as this or as
              part of file like in renamed */}

              <td>{deleted.size}</td>
              <td>
                {deleted.mtime.toLocaleString()}
                <br />
                {deleted.atime.toLocaleString()}
                <br />
                {deleted.ctime.toLocaleString()}
              </td>
              <td>{deleted.hash.sha1sum}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default DeletedFilesComponent;

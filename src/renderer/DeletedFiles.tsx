import { File } from '../domain/file-system-tools';

function DeletedFilesComponent({ deletedFiles }: { deletedFiles: File[] }) {
  return (
    <table>
      <caption>Deleted Files</caption>
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
            <td>
              {deleted.mtime}
              <br />
              {deleted.atime}
              <br />
              {deleted.ctime}
            </td>
            <td>{deleted.hash}</td>
          </tr>
        );
      })}
    </table>
  );
}

export default DeletedFilesComponent;

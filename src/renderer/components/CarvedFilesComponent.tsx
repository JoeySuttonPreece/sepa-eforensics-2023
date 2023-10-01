import { CarvedFile } from 'domain/other-cli-tools';

export default function CarvedFilesComponent({
  carvedFiles,
}: {
  carvedFiles: CarvedFile[];
}) {
  return (
    <table>
      <caption>Carved Files</caption>
      <tbody>
        <tr>
          <th>File Name</th>
          <th>Size</th>
          <th>Sector</th>
          <th>Modified Date</th>
          <th>Filetype</th>
        </tr>
        {carvedFiles?.map((file) => {
          return (
            <tr key={file.filename}>
              <td>{file.filename}</td>
              <td>{file.size}</td>
              <td>{file.sector}</td>
              <td>{file.modifiedDate?.toLocaleString()}</td>
              <td>{file.filetype}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

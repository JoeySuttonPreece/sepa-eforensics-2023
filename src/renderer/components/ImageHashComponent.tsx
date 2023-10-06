import { Hash } from '../../domain/other-cli-tools';

function ImageHashComponent({ hash, title }: { hash: Hash; title: string }) {
  return (
    <table>
      <caption>{title}</caption>
      <tbody>
        <tr>
          <th>File</th>
          <td>{hash.fileName}</td>
        </tr>
        <tr>
          <th>MD5 Hash</th>
          <td>{hash.md5sum}</td>
        </tr>
        <tr>
          <th>SHA1 Hash</th>
          <td>{hash.sha1sum}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default ImageHashComponent;

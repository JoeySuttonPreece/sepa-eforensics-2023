import {RenamedFile } from "../domain/file-system-tools";

const RenamedFilesComponent =  ({renamedFiles} : {renamedFiles: RenamedFile[]}) => {
    return (
        <table>
            <caption>Renamed Files</caption>
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
                        <td>{renamed.trueExtensions.map((value) => {
                            return <span>{value} </span>
                        })}</td>
                        <td>{renamed.file.mtime}<br/>{renamed.file.atime}<br/>{renamed.file.ctime}</td>
                        <td>{renamed.file.hash}</td>
                    </tr>
                );
            })}

        </table>
    )
}

export default RenamedFilesComponent;

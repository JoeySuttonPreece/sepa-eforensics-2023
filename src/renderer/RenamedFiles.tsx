import { File } from "../domain/file-system-tools";

const RenamedFilesComponent =  ({header, renamedFiles} : {header: string, renamedFiles: File[]| undefined}) => {
    return (
        <table>
            <caption>{header}</caption>
            <tr>
                <th>Inode</th>
                <th>FilePath</th>
                <th>True Ext.</th>
                <th>Size</th>
                <th>MAC Date</th>
            </tr>
            {
                renamedFiles?.map((renamed) => {
                    return (
                        <tr>
                            <td>{renamed.file.inode}</td>
                            <td>{renamed.file.filepath}</td>
                            <td>{renamed.true_ext}</td>
                            <td>{renamed.file.modified.getUTCDate()}<br/>{renamed.file.access.getUTCDate()}<br/>{renamed.file.created.getUTCDate()}</td>
                        </tr>
                    );
                })
            }

        </table>
    )
}

export default RenamedFilesComponent;

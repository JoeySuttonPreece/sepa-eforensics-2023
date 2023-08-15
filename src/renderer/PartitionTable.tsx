import { PartitionTable } from "../domain/volume-system-tools";

const PartitionTableComponent =  ({header, partitionTable} : {header: string, partitionTable: PartitionTable| undefined}) => {
    return (
        <table>
            <caption>{header}</caption>
            <thead>
                <tr><td>Table Type: {partitionTable?.tableType}</td></tr>
                <tr><td>Sector Size: {partitionTable?.sectorSize}</td></tr>
            </thead>
            <tr>
                <th>Description</th>
                <th>Start</th>
                <th>End</th>
                <th>Length</th>
            </tr>
            {
                partitionTable?.partitions.map((partition) => {
                    return (
                        <tr>
                            <td>{partition.description}</td>
                            <td>{partition.start}</td>
                            <td>{partition.end}</td>
                            <td>{partition.length}</td>
                        </tr>
                    );
                })
            }

        </table>
    )
}

export default PartitionTableComponent;

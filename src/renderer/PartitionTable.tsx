import { PartitionTable } from '../domain/volume-system-tools';

function PartitionTableComponent({
  partitionTable,
}: {
  partitionTable: PartitionTable;
}) {
  return (
    <table>
      <caption>Partition Table</caption>
      <thead>
        <tr>
          <td colSpan={4}>
            <strong>Table Type:</strong> {partitionTable.tableType}
          </td>
        </tr>
        <tr>
          <td colSpan={4}>
            <strong>Sector Size:</strong> {partitionTable.sectorSize}
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>Description</th>
          <th>Start</th>
          <th>End</th>
          <th>Length</th>
        </tr>
        {partitionTable.partitions.map((partition, index) => {
          return (
            <tr key={index}>
              <td>{partition.description}</td>
              <td>{partition.start}</td>
              <td>{partition.end}</td>
              <td>{partition.length}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default PartitionTableComponent;

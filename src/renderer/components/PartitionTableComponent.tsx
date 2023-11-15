import { PartitionTable } from '../../domain/volume-system-tools';
import styles from '../pages/ReportPage/ReportPage.scss';

function PartitionTableComponent({
  partitionTable,
}: {
  partitionTable: PartitionTable;
}) {
  return (
    <>
      <h2 className={styles.tableTitle}>Partition Table</h2>
      <div className={styles.subtitle}>
        <div>
          <span className={styles.bold}>Table Type: </span>
          {partitionTable.tableType}
        </div>
        <div>
          <span className={styles.bold}>Sector Size: </span>
          {partitionTable.sectorSize} Bytes
        </div>
      </div>
      <table className={styles.tableSingleHeader}>
        <tbody>
          <tr>
            <th>Description</th>
            <th>Start</th>
            <th>End</th>
            <th>Length</th>
          </tr>
          {partitionTable.partitions.map((partition) => (
            <tr key={partition.start}>
              <td>{partition.description}</td>
              <td>{partition.start}</td>
              <td>{partition.end}</td>
              <td>{partition.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default PartitionTableComponent;

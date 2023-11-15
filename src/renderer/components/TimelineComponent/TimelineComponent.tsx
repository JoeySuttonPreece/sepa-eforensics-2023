import classcat from 'classcat';
import { TimelineEntry } from 'domain/timeline-tools';
import styles from './TimelineComponent.scss';
import utilStyles from '../../pages/ReportPage/ReportPage.scss';

function TimelineComponent({ timeline }: { timeline: TimelineEntry[] }) {
  const hasOperations = !timeline.every(
    (entry) =>
      entry.suspectedUsers.length === 0 && entry.operations.length === 0
  );

  return (
    <>
      <h2 className={utilStyles.tableTitle}>Timeline</h2>
      <table
        className={classcat([styles.timeline, utilStyles.tableSingleHeader])}
      >
        <tbody>
          <tr>
            <th>Date</th>
            <th>Inode</th>
            <th>Filename</th>
            {hasOperations && (
              <>
                <th>User</th>
                <th>Operation</th>
              </>
            )}
          </tr>
          {timeline?.map((entry) => {
            return (
              <tr>
                <td>{entry.date.toLocaleString()}</td>
                <td className={styles.line}>{entry.file.inode}</td>
                <td>{entry.file.fileName}</td>
                {hasOperations && (
                  <td>
                    {entry.suspectedUsers.map((user) => {
                      if (entry.operations.length === 0) {
                        return user.name;
                      }
                      for (const op of entry.operations) {
                        if (op.user.name === user.name) {
                          return (
                            <>
                              {user.name}
                              <br />
                            </>
                          );
                        }
                      }
                    })}
                  </td>
                )}
                {hasOperations && (
                  <td>
                    {entry.operations.map((op) => {
                      return (
                        <>
                          {op.command}
                          <br />
                        </>
                      );
                    })}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default TimelineComponent;

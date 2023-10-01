import { TimelineEntry } from 'domain/timeline-tools';

function TimelineComponent({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <table id="timeline">
      <caption>Timeline</caption>
      <tbody>
        <tr>
          <th>Date</th>
          <th>Inode</th>
          <th>Filename</th>
          <th>User</th>
          <th>Operation</th>
        </tr>
        {timeline?.map((entry, index) => {
          return (
            <tr key={index}>
              <td>{entry.date.toLocaleString()}</td>
              <td className="line">{entry.file.inode}</td>
              <td>{entry.file.fileName}</td>
              <td>
                {entry.suspectedUsers.map((user) => {
                  if (entry.operations.length == 0) {
                    return user.name;
                  }
                  for (const op of entry.operations) {
                    if ((op.user.name = user.name)) {
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
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TimelineComponent;
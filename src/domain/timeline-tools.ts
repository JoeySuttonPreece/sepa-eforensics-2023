/* eslint-disable no-await-in-loop */
import { File, getInodeAtFilePath } from './file-system-tools';
import { runCliTool } from './runners';
import { PartitionTable } from './volume-system-tools';

export type User = {
  name: string;
  logs: { on: Date; off: Date; from: string }[];
  history: string[];
};

export type Operation = {
  user: User;
  command: string;
};

export type TimelineEntry = {
  date: Date;
  file: File;
  suspectedUsers: User[];
  operations: Operation[];
};

const monthMap: { [key: string]: number } = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/// NOTE: needs a partition with system information but will look at al lsuspicous files regardless of parition
// however it does assume that the home partition is the same as teh system parition this may need to e fixed

export async function buildTimeline(
  suspicousFiles: File[],
  partitionTable: PartitionTable,
  imagePath: string
): Promise<TimelineEntry[]> {
  const timeline: TimelineEntry[] = [];

  // sort suspicous files chroniliogically
  suspicousFiles.sort((a, b) => {
    return a.mtime.getTime() - b.mtime.getTime();
  });

  // get User Logon and Logoff time
  let userLogs: User[];
  try {
    userLogs = await getUserOnTime(partitionTable, imagePath);
  } catch {
    userLogs = [];
  }
  console.log(userLogs);

  // get user history
  for await (const user of userLogs) {
    try {
      user.history = await getUserHistory(user.name, partitionTable, imagePath);
    } catch {
      user.history = [];
    }
    console.log(user.history);
  }

  // create timeline item
  for (const file of suspicousFiles) {
    const timelineEntry: TimelineEntry = {
      date: file.mtime,
      file,
      suspectedUsers: [],
      operations: [],
    };

    if (userLogs.length !== 0) {
      timelineEntry.suspectedUsers = attributeUser(userLogs, file.mtime);
    }

    if (timelineEntry.suspectedUsers.length !== 0) {
      timelineEntry.operations = identifyOperations(
        file,
        timelineEntry.suspectedUsers
      );
    }

    timeline.push(timelineEntry);
  }

  return timeline;
}

export async function getUserOnTime(
  partitionTable: PartitionTable,
  imagePath: string
) {
  const userTimeLogs = '/var/log/wtmp';
  const source = await getInodeAtFilePath(
    userTimeLogs,
    partitionTable,
    imagePath
  );
  console.log('User Logs');
  console.log(source);
  if (source === undefined) return [];
  const { inode, partition } = source;
  const logs = await runCliTool(
    // Note the -F switch does not work in ReHL or CentOS 5
    `icat -o ${partition.start} ${imagePath} ${inode} | last -F`
  );
  console.log(logs);
  const lines: string[] = logs.split('\n');
  const matrix: string[][] = lines.map((line) => line.split(/\s+/));
  const userLogs: { [key: string]: User } = {};
  for (const entry of matrix) {
    const user = entry[0];
    // eslint-disable-next-line no-continue
    if (user === 'reboot') continue;
    const userLog: User = userLogs[user] ?? {
      name: user,
      logs: [],
      history: [],
    };

    const startTime = entry[6].split(':');
    const start = new Date(
      Number(entry[7]),
      monthMap[entry[4].toLowerCase()],
      Number(entry[5]),
      Number(startTime[0]),
      Number(startTime[1]),
      Number(startTime[2])
    );

    let end;
    if (entry[9] === 'crash' || entry[9] === 'down') {
      end = new Date('00/00/00 00:00:00');
    } else if (entry[8] === 'still') {
      end = new Date();
    } else {
      const endTime = entry[12].split(':');
      end = new Date(
        Number(entry[13]),
        monthMap[entry[10].toLowerCase()],
        Number(entry[11]),
        Number(endTime[0]),
        Number(endTime[1]),
        Number(endTime[2])
      );
    }

    const from = entry[2];

    userLog.logs.push({ on: start, off: end, from });

    userLogs[user] = userLog;
  }
  // Step 3 return array of user logon and log off times
  return [...Object.values(userLogs)];
}

function attributeUser(userLogs: User[], date: Date) {
  const suspectUsers: User[] = [];
  for (const user of userLogs) {
    for (const log of user.logs) {
      if (log.on <= date && log.off >= date) {
        console.log('user is on');
        suspectUsers.push(user);
        break;
      }
    }
  }

  return suspectUsers;
}

async function getUserHistory(
  user: string,
  partitionTable: PartitionTable,
  imagePath: string
) {
  const history: string[] = [];

  // get home direcotry
  const homePath = `/home/${user}`;
  const source = await getInodeAtFilePath(homePath, partitionTable, imagePath);
  if (source === undefined) return history;

  const { inode: homeDirInode, partition: homePartition } = source;

  // find hisotry files
  const historyFiles = [];
  const historyFileReg = /\.?[a-zA-Z0-9]+_history/; // why doesnt thus work!!!

  const output: string = await runCliTool(
    `fls -o ${homePartition.start} ${imagePath} ${homeDirInode} `
  );
  const lines: string[] = output.split('\n');
  // there may be more than one history file
  for (let entry of lines) {
    entry = entry.trim();
    if (historyFileReg.test(entry)) {
      const parts = entry.split(/\s+/);
      historyFiles.push(parts[1].slice(0, -1));
    }
  }

  // read hisotry = there may have been more than one hisotry file
  for (const inode of historyFiles) {
    const content = await runCliTool(
      `icat -o ${homePartition.start} ${imagePath} ${inode}`
    );
    const rows: string[] = content.split('\n');
    history.push(...rows);
  }
  return history;
}

function identifyOperations(file: File, users: User[]): Operation[] {
  const operations: Operation[] = [];
  const filepathParts = file.fileName.split('/').map((name) => {
    return name.trim();
  });

  for (const user of users) {
    for (const name of filepathParts) {
      // eslint-disable-next-line no-continue
      if (name === '') continue;
      for (const command of user.history) {
        if (command.includes(name)) {
          operations.push({ user, command });
        }
      }
    }
  }

  return operations;
}

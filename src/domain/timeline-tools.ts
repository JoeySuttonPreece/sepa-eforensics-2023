import { takeHeapSnapshot } from 'node:process';
import { File, getInodeAtFilePath } from './file-system-tools';
import { runCliTool } from './runners';
import { Partition, PartitionTable } from './volume-system-tools';

export type TimelineEntry = {
  date: Date;
  file: File;
  suspectedUsers: User[];
  operations: Operation[];
};

export type User = {
  name: string;
  logs: { on: Date; off: Date; from: string }[];
  history: string[];
};

export type Operation = {
  user: User;
  command: string;
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
  let timeline: TimelineEntry[] = [];

  //sort suspicous files chroniliogically
  suspicousFiles.sort((a, b) => {
    return a.mtime.getTime() - b.mtime.getTime();
  });

  //get User Logon and Logoff time
  let userLogs: User[] = [];
  await getUserOnTime(partitionTable, imagePath)
    .then((value) => {
      userLogs = value;
    })
    .catch((reason) => {});

  // get user history
  for (let user of userLogs) {
    await getUserHistory(user.name, partitionTable, imagePath)
      .then((value) => {
        user.history = value;
      })
      .catch((reason) => {});
  }

  // create timeline item
  for (let file of suspicousFiles) {
    let timelineEntry: TimelineEntry = {
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
  if (source == undefined) return [];
  const { inode, partition } = source;
  const logs = await runCliTool(
    //Note the -F switch does not work in ReHL or CentOS 5
    `icat -o ${partition.start} ${imagePath} ${inode} | last -F`
  );
  const lines: string[] = logs.split('\n');
  const matrix: string[][] = lines.map((line) => line.split(/\s+/));
  let userLogs: { [key: string]: User } = {};
  for (let entry of matrix) {
    let user = entry[0];
    if (user == 'reboot') continue;
    let userLog: User = userLogs[user] ?? { name: user, logs: [], history: [] };

    let startTime = entry[6].split(':');
    let start = new Date(
      Number(entry[7]),
      monthMap[entry[4].toLowerCase()],
      Number(entry[5]),
      Number(startTime[0]),
      Number(startTime[1]),
      Number(startTime[2])
    );

    if (entry[8] == 'still' || entry[9] == 'crash' || entry[9] == 'down') {
      continue; // not sure what to do here if should do current date, or date of computer etc
    }

    let endTime = entry[12].split(':');
    let end = new Date(
      Number(entry[13]),
      monthMap[entry[10].toLowerCase()],
      Number(entry[11]),
      Number(endTime[0]),
      Number(endTime[1]),
      Number(endTime[2])
    );

    let from = entry[2];

    userLog.logs.push({ on: start, off: end, from });

    userLogs[user] = userLog;
  }
  //Step 3 return array of user logon and log off times
  return [...Object.values(userLogs)];
}

function attributeUser(userLogs: User[], date: Date) {
  let suspectUsers: User[] = [];
  for (let user of userLogs) {
    for (let log of user.logs) {
      if (log.on <= date && log.off >= date) {
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
  let history: string[] = [];

  // get home direcotry
  let homePath = `/home/${user}`;
  const source = await getInodeAtFilePath(homePath, partitionTable, imagePath);
  if (source == undefined) return history;

  const { inode: homeDirInode, partition: homePartition } = source;

  //find hisotry files
  let historyFiles = [];
  let historyFileReg = /\.?[a-zA-Z0-9]+_history/; // why doesnt thus work!!!

  let output: string = await runCliTool(
    `fls -o ${homePartition.start} ${imagePath} ${homeDirInode} `
  );
  const lines: string[] = output.split('\n');
  //there may be more than one history file
  for (let entry of lines) {
    entry = entry.trim();
    if (historyFileReg.test(entry)) {
      let parts = entry.split(/\s+/);
      historyFiles.push(parts[1].slice(0, -1));
    }
  }

  //read hisotry = there may have been more than one hisotry file
  for (let inode of historyFiles) {
    let output = await runCliTool(
      `icat -o ${homePartition.start} ${imagePath} ${inode}`
    );
    let lines: string[] = output.split('\n');
    history.push(...lines);
  }
  return history;
}

function identifyOperations(file: File, users: User[]): Operation[] {
  let operations: Operation[] = [];
  let filepathParts = file.fileName.split('/').map((name) => {
    return name.trim();
  });

  for (let user of users) {
    for (let name of filepathParts) {
      if (name == '') continue;
      for (let command of user.history) {
        if (command.includes(name)) {
          operations.push({ user, command });
        }
      }
    }
  }

  return operations;
}

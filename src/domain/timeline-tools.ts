import { File, getInodeAtFilePath } from './file-system-tools';
import { runCliTool } from './runner';
import { Partition } from './volume-system-tools';

export type TimelineEntry = {
  date: Date;
  desciption: string;
};

type UserLog = {
  user: string;
  onoffpairs: { on: Date; off: Date }[];
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

export async function buildTimeline(
  suspicousFiles: File[]
): Promise<TimelineEntry[]> {
  let timeline: TimelineEntry[] = [];
  console.log(suspicousFiles);
  suspicousFiles.sort((a, b) => {
    return a.mtime.getTime() - b.mtime.getTime();
  });
  suspicousFiles.forEach((value) => {
    timeline.push({ date: value.mtime, desciption: value.fileName });
  });
  console.log('Timeline');
  console.log(timeline);
  return timeline;
}

export async function getUserOnTime(partition: Partition, imagePath: string) {
  const userTimeLogs = '/var/log/wtmp';
  const inode = await getInodeAtFilePath(userTimeLogs, partition, imagePath);
  const logs = await runCliTool(
    //Note the -F switch does not work in ReHL or CentOS 5
    `icat -o ${partition.start} ${imagePath} ${inode} | last -F`
  );
  const lines: string[] = logs.split('\n');
  const matrix: string[][] = lines.map((line) => line.split(/\s+/));

  let userLogs: { [key: string]: UserLog } = {};
  for (let entry of matrix) {
    let user = entry[0];
    if (user == 'reboot') continue;
    let userLog: UserLog = userLogs[user] ?? { user: user, onoffpairs: [] };

    let startTime = entry[6].split(':');
    let start = new Date(
      Number(entry[7]),
      monthMap[entry[4].toLowerCase()],
      Number(entry[5]),
      Number(startTime[0]),
      Number(startTime[1]),
      Number(startTime[2])
    );

    if (entry[8] == 'still' || entry[9] == 'crash') {
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

    userLog.onoffpairs.push({ on: start, off: end });

    userLogs[user] = userLog;
  }
  //Step 3 return array of user logon and log off times
  return [...Object.values(userLogs)];
}

function attributeUser(date: Date) {
  // For each User log on and log off check if the date is within the bounds
  // if yes return user name
}

function getUserHistory(user: string) {
  //Step 1 find /home/{user}/xxx_history for each shell (bash, zsh, sh, csh)
  //Step 2 execute icat -o offset image inode of history file
  //reutrn array of commands that user had executed
}

function identifyOperations(file: File, history: string[]) {
  //return possible operations invloving the file
}

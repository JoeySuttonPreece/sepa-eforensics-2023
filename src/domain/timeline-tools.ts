import { File } from './file-system-tools';
import { runCliTool } from './runner';

export type TimelineEntry = {
  date: Date;
  desciption: string;
};

type UserLogTimes = {
    user: string,
    onoffpairs: {on: Date, off:Date}[]
}

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

async function getUserOnTime() {
    let users = 
  let data = await runCliTool(`last /var/log/wtmp`).catch((reason) => {
    return false;
  });
}

function attributeUser(date: Date) {
  // return user name
}

function getUserHistory(user: string) {
  //reutrn array of commands that user had executed
}

function identifyOperations(file: File, history: string[]) {
  //return possible operations invloving the file
}

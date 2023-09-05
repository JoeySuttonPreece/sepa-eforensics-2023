export interface File {
  // x/y in output, these can be different for deleted files, cant come up with a better name
  fileNameFileType: string;
  metadataFileType: string;
  deleted: boolean;
  inode: string;
  reallocated: boolean;
  // THIS IS THE ACTUAL FILE NAME
  fileName: string;
  // maybe parse these to dates? help with timeline or something
  mtime: Date;
  atime: Date;
  ctime: Date;
  crtime: string;
  size: number;
  uid: string;
  gid: string;

  hash: string;
}

export class File implements File {
  fileNameFileType: string;

  metadataFileType: string;

  deleted: boolean;

  inode: string;

  reallocated: boolean;

  // THIS IS THE ACTUAL FILE NAME
  fileName: string;

  // maybe parse these to dates? help with timeline or something
  mtime: Date;

  atime: Date;

  ctime: Date;

  crtime: string;

  size: number;

  uid: string;

  gid: string;

  hash: string;

  public constructor() {
    this.fileNameFileType = '';
    this.metadataFileType = '';
    this.deleted = false;
    this.inode = '';
    this.reallocated = false;
    this.fileName = '';
    this.mtime = new Date();
    this.atime = new Date();
    this.ctime = new Date();
    this.crtime = '';
    this.size = 0;
    this.uid = '';
    this.gid = '';
    this.hash = '';
  }
}

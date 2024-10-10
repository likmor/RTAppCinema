export interface Message {
  user: User;
  text: string;
}

export interface RoomMessages {
  roomName: string;
  messages: Message[];
}

export interface PlayerInfo {
  paused: boolean;
  time: number;
  name: string;
}

export interface Players {
  roomName: string;
  playerInfo: PlayerInfo;
}

export interface User {
  name: string;
  image: string;
  owner: boolean;
}

export interface RoomUsers {
  roomName: string;
  users: User[];
}

export interface FileItem {
    id: string;
    name: string;
    isDir: boolean;
    childrenIds: string[];
    childrenCount: number;
    parentId: string;
  }
  
  export interface Root {
    rootFolderId: string;
    fileMap: { [key: string]: FileItem };
  }
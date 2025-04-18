export interface Message {
  user: User;
  text: string;
}

export interface RoomInfoModel {
  name: string;
  admin: UserInfoModel;
  users: UserInfoModel[];
  deletable: boolean;
}
export interface UserInfoModel {
  name: string;
  avatarId: string;
  online: boolean;
  owner: boolean;
}
export interface Room {
  roomName: string;
  users: UserPreview[];
}

export interface UserPreview {
  avatar: string;
  online: boolean;
}

export interface RoomMessages {
  roomName: string;
  messages: Message[];
}

export interface PlayerInfo {
  paused: boolean;
  currentTime: number;
  fileName: string;
}

export interface Players {
  roomName: string;
  playerInfo: PlayerInfo;
}

export interface User {
  name: string;
  image: string;
  owner: boolean;
  online: boolean;
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
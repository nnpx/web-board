export interface User {
  id: string;
  username: string;
  createdAt?: string;
}

export interface Room {
  id: number;
  name: string;
  description?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  viewsCount: number;
  createdAt: string;
  roomId: number;
  userId: string;
  username: string;
  roomName: string;
  repliesCount?: number;
}

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  parentId: string | null;
  username: string;
}

import { IUser } from './index';

declare module 'socket.io' {
  interface Socket {
    userId?: string;
    user?: IUser;
  }
}

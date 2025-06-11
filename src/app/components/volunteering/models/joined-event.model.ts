import { Event } from './event.model';

export interface User {
  userId: number;
  fullName: string;
  age: number;
  email: string;
  address: string;
  contactNo: string;
}

export interface EventJoin {
  id: number;
  joinTime: string;
  user: User;
  event: Event;
}

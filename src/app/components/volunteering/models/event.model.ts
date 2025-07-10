import { User } from "./joined-event.model";

export interface Event {
  id: number;
  user: User;
  cityName: string;
  eventDes: string;
  totalVol: number;
  noOfVolJoined: number;
  eventDate: string;
  eventTime: string;
  address: string;
  organizerName: string;
  contact: string;
  requiredSkills: string[];
}

export interface CreateEventRequest {
  userId: number;
  cityName: string;
  eventDes: string;
  totalVol: number;
  noOfVolJoined: number;
  eventDate: string;
  eventTime: string;
  address: string;
  organizerName: string;
  contact: string;
  requiredSkills: string[];
}

export interface CreateEventResponse {
  id: number;
  cityName: string;
  eventDes: string;
  totalVol: number;
  noOfVolJoined: number;
  eventDate: string;
  eventTime: string;
  address: string;
  organizerName: string;
  contact: string;
  message?: string;
  requiredSkills: string[];
}

export interface Event {
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
}

export interface CreateEventRequest {
  cityName: string;
  eventDes: string;
  totalVol: number;
  noOfVolJoined: number;
  eventDate: string;
  eventTime: string;
  address: string;
  organizerName: string;
  contact: string;
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
}

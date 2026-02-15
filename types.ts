
export enum RequestStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export interface MaintenanceRequest {
  id: string;
  studentName: string;
  roomNumber: string;
  hostel: string;
  category: 'Electrical' | 'Plumbing' | 'Carpentry' | 'Cleaning' | 'Others';
  description: string;
  status: RequestStatus;
  timestamp: string;
}

export interface MessFeedback {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  rating: number;
  comment: string;
  timestamp: string;
}

export interface GuestMeal {
  id: string;
  guestName: string;
  hostStudent: string;
  date: string;
  meals: string[];
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export interface RoomOccupancy {
  hostelName: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
}

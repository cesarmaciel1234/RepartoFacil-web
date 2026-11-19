export type OrderStatus = "Pending" | "Assigned" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";

export interface OrderItemSummary {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
}

export interface DriverOrder {
  id: string;
  clientName: string;
  customerName?: string;
  deliveryAddress: string;
  customerPhone?: string;
  items: OrderItemSummary[];
  total: number;
  status: OrderStatus;
  distanceKm?: number;
  estimatedMinutes?: number;
  branch?: string;
  driverId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DriverProfile {
  id: string;
  uid: string;
  firstName: string;
  role: "Driver";
  vehicleType?: "Motorcycle" | "Bicycle" | "Car";
  availabilityStatus?: "Available" | "Busy" | "Offline";
  createdAt: string;
}

export interface GPSCoords {
  lat: number;
  lng: number;
}

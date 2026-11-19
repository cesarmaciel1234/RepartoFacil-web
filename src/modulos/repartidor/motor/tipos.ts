export type OrderStatus = "Pending" | "Assigned" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled";

export interface OrderItemSummary {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
}

export interface GPSCoords {
  lat: number;
  lng: number;
}

export interface DriverOrder {
  id: string;
  clientName: string;
  customerName?: string;
  deliveryAddress: string;
  customerPhone?: string;
  items: OrderItemSummary[];
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  paymentMethod?: "cash" | "transfer" | "card";
  status: OrderStatus;
  
  // Métricas estándar Uber / PedidosYa
  distanceToStoreKm?: number;    // Distancia del repartidor al market
  distanceToDeliveryKm?: number; // Distancia del market al cliente
  distanceKm?: number;           // Distancia total
  estimatedMinutes?: number;
  driverEarnings?: number;       // Ganancia neta para el bolsillo del repartidor
  isPeakHour?: boolean;          // Tarifa dinámica / horario pico
  
  // Coordenadas para geocerca y mapa
  destinationCoords?: GPSCoords;
  storeCoords?: GPSCoords;
  
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

export interface WalletTransaction {
  id: string;
  orderId: string;
  type: "earning" | "cash_collection";
  amount: number;
  description: string;
  timestamp: string;
}

export interface DriverWallet {
  balance: number;          // Ganancias netas acumuladas disponibles
  cashInHand: number;       // Efectivo cobrado de clientes en mano
  completedOrdersCount: number;
  transactions: WalletTransaction[];
}

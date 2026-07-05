export interface Patient {
  id?: number;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  disease?: string;
  registeredDate?: Date;
}
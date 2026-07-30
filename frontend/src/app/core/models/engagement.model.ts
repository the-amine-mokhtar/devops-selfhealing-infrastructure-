import { User } from './user.model';

export type EngagementStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export interface Engagement {
  id?: number;
  clientName: string;
  status: EngagementStatus;
  consultant: User;
  startDate: string;
  value: number;
  deadline: string;
  deadlineAlertSent: boolean;
  logo?: string;
}

export interface EngagementFormValue {
  clientName: string;
  status: EngagementStatus;
  consultantId: number;
  startDate: string;
  value: number;
  deadline: string;
  logo?: string;
}
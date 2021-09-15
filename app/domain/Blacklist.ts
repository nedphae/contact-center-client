import { Object } from 'ts-toolbelt';

export enum PreventStrategy {
  UID,
  IP,
}

export type PreventStrategyName = keyof typeof PreventStrategy;

export interface Blacklist {
  organizationId?: number;
  staffId?: number;
  preventStrategy: PreventStrategyName;
  preventSource: string;
  effectiveTime?: number;
  failureTime?: number;
  audited?: boolean;
}

export type BlacklistFormProp = Object.Merge<
  Blacklist,
  { ip: string; uid: string }
>;

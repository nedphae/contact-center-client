import { Dictionary } from 'lodash';

export interface Properties extends Dictionary<unknown> {
  id: number;
  label: string;
  available: boolean;
  value?: string;
  personal: boolean;
}

export interface PureProperties {
  id?: number;
  label: string;
  key: string;
  available: boolean;
  value?: string;
  personal: boolean;
}

export type RootProperties = Dictionary<Properties>;

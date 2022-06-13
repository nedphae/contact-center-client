import { Dictionary } from 'lodash';

export interface Properties extends Dictionary<unknown> {
  id: number;
  label: string;
  available: boolean;
  value?: string;
}

export type RootProperties = Dictionary<Properties>;

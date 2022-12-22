export type PureProperties = {
  id?: number;
  label: string;
  key: string;
  available: boolean;
  value?: string;
  personal: boolean;
};

export type Properties = {
  id?: number;
  label: string;
  key: string;
  available: boolean;
  value?: string;
  personal: boolean;
} & { [key: string]: Properties };

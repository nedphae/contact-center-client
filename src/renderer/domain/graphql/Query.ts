export interface RangeQuery<T> {
  from?: T;
  includeLower?: boolean;
  includeUpper?: boolean;
  to?: T;
}
type Direction = 'ASC' | 'DESC';

export class PageParam {
  page = 0;

  size = 20;

  direction: Direction;

  properties?: string[] = undefined;

  constructor(
    page = 0,
    size = 20,
    direction: Direction = 'DESC',
    properties: string[] | undefined = undefined
  ) {
    this.page = page;
    this.size = size;
    this.direction = direction;
    this.properties = properties;
  }
}

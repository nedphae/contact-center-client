export interface SessionCategory {
  id?: number;
  organizationId?: number;
  staffId?: number;
  categoryName?: string;
  parentCategory?: number;
  enabled?: boolean;
  children?: SessionCategory[];
  // 用来添加
  parentCategoryItem?: SessionCategory;
}

export interface SessionCategoryEnableQuery {
  enabled: boolean;
  ids: number[];
}

export interface SessionCategoryEnableQueryInput {
  sessionCategoryEnableQuery: SessionCategoryEnableQuery;
}

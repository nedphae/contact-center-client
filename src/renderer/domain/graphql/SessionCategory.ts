import { gql } from '@apollo/client';
import { SessionCategory } from '../SessionCategory';

export const CORE_SESSION_CATEGORY_FIELDS = gql`
  fragment sessionCategoryFields on SessionCategory {
    id
    organizationId
    staffId
    categoryName
    parentCategory
    enabled
  }
`;

export const QUERY_SESSION_CATEGORY = gql`
  ${CORE_SESSION_CATEGORY_FIELDS}
  query SessionCategory($enabled: Boolean) {
    getAllSessionCategory(enabled: $enabled) {
      ...sessionCategoryFields
    }
  }
`;

export const MUTATION_SAVE_SESSION_CATEGORY = gql`
  ${CORE_SESSION_CATEGORY_FIELDS}
  mutation SessionCategory($sessionCategoryList: [SessionCategoryInput!]!) {
    saveSessionCategory(sessionCategoryList: $sessionCategoryList) {
      ...sessionCategoryFields
    }
  }
`;

export const MUTATION_ENABLE_SESSION_CATEGORY = gql`
  mutation SessionCategory(
    $sessionCategoryEnableQuery: SessionCategoryEnableQueryInput!
  ) {
    enableSessionCategory(
      sessionCategoryEnableQuery: $sessionCategoryEnableQuery
    )
  }
`;

export interface SessionCategoryGraphql {
  getAllSessionCategory: SessionCategory[];
}

export interface SaveSessionCategoryGraphql {
  saveSessionCategory: SessionCategory[];
}

export interface EnableSessionCategoryGraphql {
  enableSessionCategory: number[];
}

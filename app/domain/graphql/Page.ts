import { DocumentNode, gql } from '@apollo/client';

export default function getPageQuery(
  pageName: string,
  content: DocumentNode
): DocumentNode {
  return gql`
  ${content}
  fragment Page on ${pageName} {
    content {
        ...Content
      }
      pageable {
        offset
        pageNumber
        pageSize
        paged
        unpaged
      }
      last
      totalElements
      totalPages
      size
      number
      sort {
        unsorted
        sorted
        empty
      }
      first
      numberOfElements
      empty
    }
  }
`;
}

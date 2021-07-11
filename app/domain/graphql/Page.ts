import { DocumentNode, gql } from '@apollo/client';

export default function getPageQuery(
  pageName: string,
  content: DocumentNode,
  contentName: string
): DocumentNode {
  return gql`
  ${content}
  fragment Page${pageName} on ${pageName} {
    content {
        ...${contentName}
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
`;
}

import { KnowledgeBase, TopicCategory } from 'app/domain/Bot';
import unimplemented from 'app/utils/Error';
import React from 'react';
import KnowledgeBaseForm from './KnowledgeBaseForm';
import TopicCategoryForm from './TopicCategoryForm';

export interface TopicOrKnowladge {
  Topic?: TopicCategory | undefined;
  Knowladge?: KnowledgeBase | undefined;
}

export type TopicOrKnowladgeKey = keyof TopicOrKnowladge;

export interface FormProps<T extends TopicOrKnowladgeKey> {
  showWhat: T;
  defaultValue: TopicOrKnowladge[T];
  allTopicCategoryList: TopicCategory[];
}

export default function TopicAndKnowladgeContainer<
  T extends TopicOrKnowladgeKey
>(props: FormProps<T>) {
  const { showWhat, defaultValue, allTopicCategoryList } = props;
  switch (showWhat) {
    case 'Knowladge':
      return (
        <KnowledgeBaseForm defaultValues={defaultValue as KnowledgeBase} />
      );
    case 'Topic':
      return (
        <TopicCategoryForm
          defaultValues={defaultValue as TopicCategory}
          allTopicCategoryList={allTopicCategoryList}
        />
      );
    default:
      unimplemented();
  }
}

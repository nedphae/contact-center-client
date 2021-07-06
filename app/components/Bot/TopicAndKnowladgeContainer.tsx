import { KnowledgeBase, TopicCategory } from 'app/domain/Bot';
import unimplemented from 'app/utils/Error';
import React from 'react';
import KnowledgeBaseForm from './KnowledgeBaseForm';
import TopicCategoryForm from './TopicCategoryForm';

export interface DefaultValueType {
  Topic: TopicCategory | undefined;
  Knowladge: KnowledgeBase | undefined;
}

export type TopicOrKnowladge = keyof DefaultValueType;

export interface FormProps<T extends TopicOrKnowladge> {
  showWhat: T;
  defaultValue: DefaultValueType[T];
  allTopicCategoryList: TopicCategory[];
}

export default function TopicAndKnowladgeContainer<T extends TopicOrKnowladge>(
  props: FormProps<T>
) {
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
      return unimplemented();
  }
}

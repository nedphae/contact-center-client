import { useQuery } from '@apollo/client';
import { ListItem, ListItemText } from '@material-ui/core';
import {
  QUERY_TOPIC_BY_IDS,
  TopicByIdsGraphql,
} from 'renderer/domain/graphql/Bot';

interface HotQuestionListProps {
  hotQuestion: string;
}

export default function HotQuestionList(props: HotQuestionListProps) {
  const { hotQuestion } = props;
  const hotQuesionIds = hotQuestion.split(',');
  const { data } = useQuery<TopicByIdsGraphql>(QUERY_TOPIC_BY_IDS, {
    variables: {
      ids: hotQuesionIds,
    },
  });

  const topicList = data?.getTopicByIds;

  if (topicList) {
    return (
      <>
        {topicList.map((it) => (
          <ListItem>
            <ListItemText primary={it.question} />
          </ListItem>
        ))}
      </>
    );
  }
  return <></>;
}

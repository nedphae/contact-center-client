import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { TreeTable, TreeState, Row } from 'cp-react-tree-table';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { Button, ButtonGroup, ListItem, ListItemText } from '@material-ui/core';
import { useMutation, useQuery } from '@apollo/client';
import {
  MUTATION_ENABLE_SESSION_CATEGORY,
  QUERY_SESSION_CATEGORY,
  SessionCategoryGraphql,
} from 'app/domain/graphql/SessionCategory';
import {
  SessionCategory,
  SessionCategoryEnableQueryInput,
} from 'app/domain/SessionCategory';
import { TreeNodeProps } from 'react-dropdown-tree-select';
import DraggableDialog, {
  DraggableDialogRef,
} from 'app/components/DraggableDialog/DraggableDialog';
import useAlert from 'app/hook/alert/useAlert';
import SessionCategoryForm from './form/SessionCategoryForm';

const useStyles = makeStyles(() =>
  createStyles({
    treeTable: {
      // paddingBottom: 50,
      width: '100%',
      overflow: 'auto',
      border: '1px solid rgb(255 255 255)',
    },
    categoryName: {
      textAlign: 'left',
    },
    employeesCell: {
      width: '100%',
      textAlign: 'right',
    },
  })
);

interface TreeNode {
  data: SessionCategory;
  children?: Array<TreeNode>;
  height?: number;
}

function createTreeState(sessionCategoryList: SessionCategory[]): TreeNode[] {
  // 生成嵌套对象
  const rootList: TreeNode[] = sessionCategoryList.map((it) => {
    return {
      data: it,
      height: 50,
    };
  });
  const pMap = _.groupBy(rootList, (it) => it.data.parentCategory);
  const treeNodeList = rootList
    .map((it) => {
      if (it.data.id) {
        it.children = pMap[it.data.id];
      }
      return it;
    })
    .filter((it) => !it.data.parentCategory);
  return treeNodeList;
}

function treeNodeToTreeNodeProps(
  treeNedeList: TreeNode[],
  checkId?: number
): TreeNodeProps[] {
  return treeNedeList
    .filter((it) => it.data.id)
    .map((it) => {
      const node: TreeNodeProps = {
        label: it.data.categoryName ?? '',
        value: it.data.id?.toString() ?? '',
        checked: Boolean(checkId) && it.data.id === checkId,
      };
      if (it.children) {
        node.children = treeNodeToTreeNodeProps(it.children, checkId);
      }
      return node;
    });
}

export default function SessionCategoryView() {
  const classes = useStyles();
  const treeTableRef = useRef(null);
  const refOfDialog = useRef<DraggableDialogRef>(null);
  const [treeValue, setTreeValue] = useState(TreeState.createEmpty());
  const [treeNodeList, setTreeNodeList] = useState<TreeNode[]>([]);
  const [selectSessionCategory, setSelectSessionCategory] =
    useState<SessionCategory>();
  const { data, refetch } = useQuery<SessionCategoryGraphql>(
    QUERY_SESSION_CATEGORY,
    {
      variables: { enabled: true },
    }
  );

  const { onLoadding, onCompleted, onError } = useAlert();
  const [enableSessionCategory, { loading }] = useMutation<
    unknown,
    SessionCategoryEnableQueryInput
  >(MUTATION_ENABLE_SESSION_CATEGORY, {
    onCompleted,
    onError,
  });
  if (loading) {
    onLoadding(loading);
  }

  const sessionCategoryList = data?.getAllSessionCategory;
  useEffect(() => {
    if (sessionCategoryList) {
      const treeNedeList: TreeNode[] = createTreeState(sessionCategoryList);
      setTreeValue(TreeState.create(treeNedeList));
      setTreeNodeList(treeNedeList);
    }
  }, [sessionCategoryList]);

  const handleOnChange = (newValue: TreeState) => {
    setTreeValue(newValue);
  };

  const tableHeight = window.innerHeight - 220;

  async function handleDelete(id: number) {
    await enableSessionCategory({
      variables: { sessionCategoryEnableQuery: { enabled: false, ids: [id] } },
    });
    refetch();
  }

  const renderIndexCell = (row: Row) => {
    return (
      <div style={{ paddingLeft: `${row.metadata.depth * 15}px` }}>
        <ListItem button onClick={row.toggleChildren}>
          <ListItemText primary={row.data.categoryName} />
          {row.metadata.hasChildren &&
            (row.$state.isExpanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
      </div>
    );
  };

  const renderHeaderCell = (name: string, alignLeft = true) => {
    const header = () => (
      <span className={alignLeft ? 'align-left' : 'align-right'}>{name}</span>
    );
    return header;
  };

  const renderOperatorCell = (row: Row) => {
    return (
      <>
        <Button
          size="large"
          onClick={() => {
            setSelectSessionCategory(row.data);
            refOfDialog.current?.setOpen(true);
          }}
        >
          修改
        </Button>
        <Button
          size="large"
          onClick={() => {
            setSelectSessionCategory({
              parentCategory: row.data.id,
            });
            refOfDialog.current?.setOpen(true);
          }}
        >
          新增子项
        </Button>
        <Button size="large" onClick={() => handleDelete(row.data.id)}>
          删除
        </Button>
      </>
    );
  };

  return (
    <>
      <ButtonGroup size="large" aria-label="new">
        <Button
          onClick={() => {
            setSelectSessionCategory(undefined);
            refOfDialog.current?.setOpen(true);
          }}
        >
          新增
        </Button>
        <Button
          onClick={() => {
            refetch();
          }}
        >
          刷新
        </Button>
      </ButtonGroup>
      <DraggableDialog title="添加/修改 咨询类型" ref={refOfDialog}>
        <SessionCategoryForm
          defaultValues={selectSessionCategory}
          treeNodeProps={treeNodeToTreeNodeProps(
            treeNodeList,
            selectSessionCategory?.parentCategory
          )}
          refetch={() => refetch()}
        />
      </DraggableDialog>
      <TreeTable
        className={classes.treeTable}
        ref={treeTableRef}
        headerHeight={32}
        height={tableHeight}
        value={treeValue}
        onChange={handleOnChange}
      >
        <TreeTable.Column
          renderCell={renderIndexCell}
          renderHeaderCell={renderHeaderCell('咨询类型')}
        />
        <TreeTable.Column
          renderCell={renderOperatorCell}
          renderHeaderCell={renderHeaderCell('操作')}
          basis="300px"
          grow={0}
        />
      </TreeTable>
    </>
  );
}

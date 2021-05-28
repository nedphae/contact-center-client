import React from 'react';
import {
  DataGrid,
  GridColDef,
  GridLocaleText,
  GridValueGetterParams,
  GridToolbar,
} from '@material-ui/data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'fromShuntName', headerName: '接待组', width: 150 },
  { field: 'fromGroupName', headerName: '客服组', width: 150 },
  { field: 'fromIp', headerName: '访客来源ip', width: 150 },
  { field: 'fromPage', headerName: '来源页', width: 150 },
  { field: 'fromTitle', headerName: '来源页标题', width: 150 },
  { field: 'fromType', headerName: '来源类型', width: 150 },
  {
    field: 'inQueueTime',
    headerName: '在列队时间',
    type: 'number',
    width: 80,
  },
  {
    field: 'interaction',
    headerName: '来源类型',
    width: 150,
    valueGetter: (params: GridValueGetterParams) => {
      let result = '机器人会话';
      if (params.getValue(params.id, 'interaction') === 1) {
        result = '客服正常会话';
      }
      return result;
    },
  },
  { field: 'convType', headerName: '会话类型', width: 150 },
  { field: 'staffId', headerName: '客服ID', width: 150 },
  { field: 'staffId', headerName: '客服实名', width: 150 },
  { field: 'nickName', headerName: '客服昵称', width: 150 },
  { field: 'startTime', headerName: '开始时间', width: 150 },
  { field: 'nickName', headerName: '客服昵称', width: 150 },
  { field: 'nickName', headerName: '客服昵称', width: 150 },
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 110,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.getValue(params.id, 'firstName') || ''} ${
        params.getValue(params.id, 'lastName') || ''
      }`,
  },
];

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

export const GRID_DEFAULT_LOCALE_TEXT: GridLocaleText = {
  rootGridLabel: '根',
  // Root
  noRowsLabel: '没有数据',
  noResultsOverlayLabel: '结果未找到.',
  errorOverlayDefaultLabel: '发送错误.',

  // Density selector toolbar button text
  toolbarDensity: '密度',
  toolbarDensityLabel: '密度',
  toolbarDensityCompact: '紧密',
  toolbarDensityStandard: '标准',
  toolbarDensityComfortable: '疏散',

  // Columns selector toolbar button text
  toolbarColumns: '列',
  toolbarColumnsLabel: '选择列',

  // Filters toolbar button text
  toolbarFilters: '过滤器',
  toolbarFiltersLabel: '显示过滤器',
  toolbarFiltersTooltipHide: '隐藏过滤器',
  toolbarFiltersTooltipShow: '显示过滤器',
  toolbarFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} 已经过滤` : `${count} 已经过滤`,

  // Export selector toolbar button text
  toolbarExport: '导出',
  toolbarExportLabel: '导出',
  toolbarExportCSV: '导出为 CSV',

  // Columns panel text
  columnsPanelTextFieldLabel: '查找列',
  columnsPanelTextFieldPlaceholder: '列标题',
  columnsPanelDragIconLabel: '重新排序列',
  columnsPanelShowAllButton: '全部显示',
  columnsPanelHideAllButton: '全部隐藏',

  // Filter panel text
  filterPanelAddFilter: '添加过滤器',
  filterPanelDeleteIconLabel: '删除',
  filterPanelOperators: '操作',
  filterPanelOperatorAnd: '和',
  filterPanelOperatorOr: '或',
  filterPanelColumns: '列',
  filterPanelInputLabel: '值',
  filterPanelInputPlaceholder: '过滤值',

  // Filter operators text
  filterOperatorContains: '包含',
  filterOperatorEquals: '等于',
  filterOperatorStartsWith: '开始于',
  filterOperatorEndsWith: '结束于',
  filterOperatorIs: '是',
  filterOperatorNot: '不是',
  filterOperatorAfter: '之后',
  filterOperatorOnOrAfter: '在或之后',
  filterOperatorBefore: '之前',
  filterOperatorOnOrBefore: '在或之前',

  // Filter values text
  filterValueAny: '任何',
  filterValueTrue: '是',
  filterValueFalse: '否',

  // Column menu text
  columnMenuLabel: '菜单',
  columnMenuShowColumns: '显示列',
  columnMenuFilter: '过滤',
  columnMenuHideColumn: '隐藏',
  columnMenuUnsort: '取消排序',
  columnMenuSortAsc: '升序',
  columnMenuSortDesc: '降序',

  // Column header text
  columnHeaderFiltersTooltipActive: (count) =>
    count !== 1 ? `${count} 已经过滤` : `${count} 已经过滤`,
  columnHeaderFiltersLabel: '显示过滤',
  columnHeaderSortIconLabel: '排序',

  // Rows selected footer text
  footerRowSelected: (count) =>
    count !== 1
      ? `${count.toLocaleString()} 列已经选择`
      : `${count.toLocaleString()} 列已经选择`,

  // Total rows footer text
  footerTotalRows: '全部行:',

  // Checkbox selection text
  checkboxSelectionHeaderName: '选择框',

  // Boolean cell text
  booleanCellTrueLabel: '是',
  booleanCellFalseLabel: '否',
};

export default function DataGridDemo() {
  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        onRowClick={(param) => {
          console.info(param.row);
          // 显示对话框
        }}
        localeText={GRID_DEFAULT_LOCALE_TEXT}
        disableSelectionOnClick
        components={{
          Toolbar: GridToolbar,
        }}
        pagination
        pageSize={3}
        // 全部的列表
        rowCount={9}
        paginationMode="server"
        onPageChange={(param) => {
          // {page: 2, pageCount: 3, pageSize: 3, paginationMode: "server", rowCount: 9}
        }}
        onPageSizeChange={(param) => {
          // {page: 0, pageCount: 1, pageSize: 25, paginationMode: "server", rowCount: 9}
          console.info(param);
        }}
      />
    </div>
  );
}

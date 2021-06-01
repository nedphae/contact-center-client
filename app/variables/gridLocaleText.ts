import { GridLocaleText } from '@material-ui/data-grid';

const GRID_DEFAULT_LOCALE_TEXT: GridLocaleText = {
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

export default GRID_DEFAULT_LOCALE_TEXT;

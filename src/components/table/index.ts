export {
  TableRoot as Root,
  TableToolbar as Toolbar,
  TableSearch as Search,
  TableContent as Content,
  TableFooter as Footer,
  TablePagination as Pagination,
  TablePageSize as PageSize,
  TableSelectedCount as SelectedCount,
  TableBulkActions as BulkActions,
  TableColumnVisibility as ColumnVisibility,
  createSelectionColumn, // keeps its name: it's a function that builds a column, not a component
} from './table'

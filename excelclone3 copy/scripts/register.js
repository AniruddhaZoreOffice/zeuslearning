
import ColumnResizeHandler from './resizeHandlers/columnResizeHandler.js';
import RowResizeHandler from './resizeHandlers/rowResizeHandler.js';
import RangeSelector from './selectionHandlers/rangeSelector.js';
import ColumnSelector from './selectionHandlers/columnSelector.js';
import RowSelector from './selectionHandlers/rowSelector.js';

export const HANDLER_CLASSES = [
    ColumnResizeHandler,
    RowResizeHandler,
    ColumnSelector,
    RowSelector,
    RangeSelector
];

export const HANDLER_CURSOR_MAP = new Map([
    [ColumnResizeHandler, 'col-resize'],
    [RowResizeHandler, 'row-resize'],
    [ColumnSelector, 'pointer'],
    [RowSelector, 'pointer'],
    [RangeSelector, 'cell']
]);
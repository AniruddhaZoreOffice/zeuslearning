import ColumnResizeHandler from './resizeHandlers/columnResizeHandler.js';
import RowResizeHandler from './resizeHandlers/rowResizeHandler.js';
import RangeSelector from './selectionHandlers/rangeSelector.js';
import ColumnSelector from './selectionHandlers/columnSelector.js';
import RowSelector from './selectionHandlers/rowSelector.js';

import ColumnInsertLeftHandler from './insertionHandlers/columnInsertLeftHandler.js';
import ColumnInsertRightHandler from './insertionHandlers/columnInsertRightHandler.js';
import RowInsertAboveHandler from './insertionHandlers/rowInsertAboveHandler.js';
import RowInsertBelowHandler from './insertionHandlers/rowInsertBelowHandler.js';

export const HANDLER_CLASSES = [
    
    ColumnInsertLeftHandler,
    ColumnInsertRightHandler,
    RowInsertAboveHandler,
    RowInsertBelowHandler,
    
    ColumnResizeHandler,
    RowResizeHandler,
    ColumnSelector,
    RowSelector,
    RangeSelector
];

export const HANDLER_CURSOR_MAP = new Map([
   
    [ColumnInsertLeftHandler, 'pointer'],
    [ColumnInsertRightHandler, 'pointer'],
    [RowInsertAboveHandler, 'pointer'],
    [RowInsertBelowHandler, 'pointer'],
    
    [ColumnResizeHandler, 'col-resize'],
    [RowResizeHandler, 'row-resize'],
    [ColumnSelector, 'url("scripts/assets/selectColumnIcon.svg"), pointer'],
    [RowSelector, 'url("scripts/assets/selectRowIcon.svg"),pointer'],
    [RangeSelector, 'cell']
]);
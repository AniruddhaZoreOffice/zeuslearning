import { GridManager } from "./grid.js";
const gridHeight = 600;
const gridWidth = 1000;
const totalRows = 100000;
const totalColumns = 500;
const cellWidth = 100.5;
const cellHeight = 30.5;
console.log("reached main");
const grid = new GridManager(gridHeight, gridWidth, totalRows, totalColumns, cellWidth, cellHeight);

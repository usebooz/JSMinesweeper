'use strict'

import { CELL_STATE, CELL_VALUE, GAME_STATE } from './minesweeper.constants.js';

export default class MinesweeperModel {

    constructor() {
        /** 
         * @type {Array.<Array.<{value: string, state: string}>>}
         */
        this.grid = null;
        /** 
         * @type {Array.<Array.<{x: number, y: number}>>}
         */
        this.mines = null;
        /** 
         *  @type {{mines: number, state: string, time:number}}
         * */
        this.game = null;
        this.timerId = null;
    }

    /**
     * @param {{width: number, height: number, mines: number}} level 
     */
    initialize(level) {
        this.initializeGame(level);
        this.generateGrid(level);
        this.generateMines(level);
        clearInterval(this.timerId);
        this.timerId = setInterval(() => this.game.time++, 1000);
        setTimeout(() => clearInterval(this.timerId), 1000000);
    }

    /**
     * @param {{width: number, height: number, mines: number}} level 
     */
    initializeGame(level) {
        this.game = { 
            mines: level.mines,
            state: GAME_STATE.GOON,
            time: 0,
        };
    }

    /**
     * @param {{width: number, height: number, mines: number}} level 
     */
    generateGrid(level) {
        this.grid = [];
        for (let i = 0; i < level.height; i++) {
            this.grid[i] = [];
            for (let j = 0; j < level.width; j++) {
                this.grid[i][j] = {
                    value: CELL_VALUE.NULL,
                    state: CELL_STATE.CLOSED,
                };
            }
        }
    }

    /**
     * @param {{width: number, height: number, mines: number}} level 
     */
    generateMines(level) {
        this.mines = [];
        while (this.mines.length != level.mines) {
            let mine = {
                x: Math.floor(Math.random() * level.width),
                y: Math.floor(Math.random() * level.height),
            };
            if (!this.isCellMine(mine)) this.mines.push(mine);
        }
    }

    /**
     * @param {{x: number, y: number}} cell 
     */
    isCellMine(cell) {
        return Boolean(this.mines.find(mine => mine.x == cell.x && mine.y == cell.y));
    }

    /**
     * @param {{x: number, y: number}} cell
     */
    isCellOpen(cell) {
        return this.grid[cell.y][cell.x].state == CELL_STATE.OPENED ||
            this.grid[cell.y][cell.x].state == CELL_STATE.BOMBED;
    }

    /**
     * @param {{x: number, y: number}} cell
     */
    isCellFlag(cell) {
        return this.grid[cell.y][cell.x].value == CELL_VALUE.FLAG;
    }

    /**
     * @param {{x: number, y: number}} cell
     */
    isCellNull(cell) {
        return this.grid[cell.y][cell.x].value == CELL_VALUE.NULL;
    }

    /**
     * @return {boolean}
     */
    isGameLost() {
        return this.game.state == GAME_STATE.LOST;
    }

    /**
     * @return {boolean}
     */
    isGameWon() {
        return this.game.state == GAME_STATE.WON;
    }

    /**
     * @param {{x: number, y: number}} cell
     */
    isMinesFound(cell) {
        return this.countMinesAround(cell) == this.countFlagsAround(cell);
    }

    /**
     * @param {{x: number, y: number}} cell
     */
    openCell(cell) {
        if (this.isGameWon()) {
            return;
        }
        if (this.isCellOpen(cell)) {
            return;
        }
        this.grid[cell.y][cell.x].state = CELL_STATE.OPENED;
        if (this.isCellMine(cell)) {
            this.grid[cell.y][cell.x].value = CELL_VALUE.MINE;
        } else {
            if (this.isCellFlag(cell)) this.game.mines++;
            this.grid[cell.y][cell.x].value = CELL_VALUE.DIGITS[this.countMinesAround(cell)];
            if (this.isCellNull(cell)) this.openCellsAround(cell, true, false);
        }
        if (this.isGameLost()) {
            return;
        }
        if (this.isCellMine(cell)) {
            this.grid[cell.y][cell.x].state = CELL_STATE.BOMBED;
            this.game.state = GAME_STATE.LOST;
            clearInterval(this.timer);
            return;
        }
        if (this.getCells(true, false).length == this.mines.length) { 
            this.game.state = GAME_STATE.WON;
            clearInterval(this.timer);
            return;            
        }
    }

    /**
     * @param {{x: number, y: number}} cell
     * @param {boolean} closed
     * @param {boolean} unflag
     */
    openCellsAround(cell, closed, unflag) {
        this.getCellsAround(cell, closed, unflag).forEach(cell => this.openCell(cell));
    }

    openMines() {
        this.mines.filter(mine => !this.isCellFlag(mine)).forEach(mine => this.openCell(mine));
    }

    openFlags() {
        this.getCells(true, false)
            .filter(cell => this.isCellFlag(cell) && !this.isCellMine(cell))
            .forEach(cell => this.openFlag(cell))
    }

    /**
     * @param {{x: number, y: number}} cell
     */
    openFlag(cell) {
        if (!this.isGameLost()) {
            return;
        }
        if (!this.isCellFlag(cell)) {
            return;
        }
        this.grid[cell.y][cell.x].value = CELL_VALUE.CROSS;
        this.grid[cell.y][cell.x].state = CELL_STATE.OPENED;
    }

    flagMines() {
        this.mines.filter(mine => !this.isCellFlag(mine)).forEach(mine => this.flagCell(mine));
    }

    /**
     * @param {{x: number, y: number}} cell
     */
    flagCell(cell) {
        if (this.isGameLost()) {
            return;
        }
        if (this.isCellOpen(cell)) {
            return;
        }
        if (this.isCellFlag(cell)) {
            this.grid[cell.y][cell.x].value = CELL_VALUE.NULL;
            this.game.mines++;
        } else {
            this.grid[cell.y][cell.x].value = CELL_VALUE.FLAG;
            this.game.mines--;
        }
    }

    /**
     * @param {{x: number, y: number}} cell
     * @return {number}
     */
    countMinesAround(cell) {
        return this.getCellsAround(cell, true, false)
            .reduce((minesCount, cell) => this.isCellMine(cell) ? ++minesCount : minesCount, 0);
    }

    /**
     * @param {{x: number, y: number}} cell
     * @return {number}
     */
    countFlagsAround(cell) {
        return this.getCellsAround(cell, true, false)
            .reduce((flagsCount, cell) => this.isCellFlag(cell) ? ++flagsCount : flagsCount, 0);
    }

    /**
     * @param {{x: number, y: number}} cell
     * @param {boolean} closed
     * @param {boolean} unflag
     * @return {Array.<Array.<{x: number, y: number}>>} 
     */
    getCellsAround(cell, closed, unflag) {
        let cells = [];
        for (let i = Math.max(cell.y - 1, 0); i <= Math.min(cell.y + 1, this.grid.length - 1); i++) {
            for (let j = Math.max(cell.x - 1, 0); j <= Math.min(cell.x + 1, this.grid[i].length - 1); j++) {
                if (cell.x == j && cell.y == i) continue;
                if (closed && this.isCellOpen({ x: j, y: i })) continue;
                if (unflag && this.isCellFlag({ x: j, y: i })) continue;
                cells.push({ x: j, y: i });
            }
        }
        return cells;
    }

    /**
     * @param {boolean} closed
     * @param {boolean} unflag
     * @return {Array.<Array.<{x: number, y: number}>>} 
     */
    getCells(closed, unflag) {
        let cells = [];
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                if (closed && this.isCellOpen({ x: j, y: i })) continue;
                if (unflag && this.isCellFlag({ x: j, y: i })) continue;
                cells.push({ x: j, y: i });
            }
        }
        return cells;
    }

}
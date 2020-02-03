'use strict';

import minesweeperHTML from './minesweeper.view.html';
import { ELEMENT_ID, ELEMENT_NAME } from './minesweeper.constants.js';

export default class MinesweeperView {

    /**
     * @param {HTMLDivElement} rootElement
     */
    constructor(rootElement) {
        this.onClickLevel = null;
        this.onClickRestart = null;
        this.onClickCell = null;
        this.onContextCell = null;
        /**
         * @type {HTMLDivElement} 
         */
        this.rootElement = rootElement;
        this.rootElement.innerHTML = minesweeperHTML;
    }

    /**  
     * @return {{width: number, height: number, mines: number}}
     */
    get checkedLevel() {
        return Object.assign({ width: null, height: null, mines: null },
            this.rootElement.querySelector(`[name='${ELEMENT_NAME.LEVEL}']:checked`).dataset);
    }

    /**  
     * @return {HTMLTableElement}
     */
    get gridElement() {
        return this.rootElement.querySelector(`#${ELEMENT_ID.GRID}`);
    }

    /**  
     * @return {HTMLTableElement}
     */
    get gameElement() {
        return this.rootElement.querySelector(`#${ELEMENT_ID.GAME}`);
    }   
    
    /**  
     * @return {HTMLSpanElement}
     */
    get minesElement() {
        return this.rootElement.querySelector(`#${ELEMENT_ID.MINES}`);
    }  
    
    /**  
     * @return {HTMLButtonElement}
     */
    get stateElement() {
        return this.rootElement.querySelector(`#${ELEMENT_ID.STATE}`);
    }  
        
    /**  
     * @return {HTMLTableHeaderCellElement}
     */
    get timeElement() {
        return this.rootElement.querySelector(`#${ELEMENT_ID.TIME}`);
    } 

    /**
     * @param {HTMLTableCellElement} cellElement
     * @return {{x: number, y: number}}
     */
    getCell(cellElement) {
        return { x: cellElement.cellIndex, y: cellElement.parentNode.rowIndex }
    }

    /**
     * @param {Array.<Array.<{value: string, state: string}>>} grid  
     * @param {{mines: number, state: string, time:number}} game
     */
    initialize(grid, game) {
        this.rootElement.querySelectorAll(`[name='${ELEMENT_NAME.LEVEL}']`).forEach(element => element.onclick = this.onClickLevel);
        this.stateElement.onclick = this.onClickRestart;
        this.stateElement.parentElement.setAttribute("width", this.gridElement.dataset.width * (grid[0].length - 6));
        this.renderGame(game);
        this.renderGrid(grid);
    }

    /**
     * @param {Array.<Array.<{value: string, state: string}>>} grid 
     */
    renderGrid(grid) {
        this.gridElement.innerHTML = "";
        grid.forEach((row, rowIndex) => {
            let rowElement = this.gridElement.insertRow(rowIndex);
            rowElement.setAttribute("height", this.gridElement.dataset.height);
            row.forEach((cell, cellIndex) => {
                let cellElement = rowElement.insertCell(cellIndex);
                cellElement.setAttribute("width", this.gridElement.dataset.width);
                cellElement.onclick = this.onClickCell;
                cellElement.oncontextmenu = this.onContextCell;
                cellElement.className = cell.state;
                cellElement.innerText = cell.value;
            });
        });
    }

    /** 
     * @param {{mines: number, state: string, time:number}} game
     */
    renderGame(game) {
        this.minesElement.innerText = game.mines;
        this.stateElement.innerText = game.state;   
        this.timeElement.innerText = game.time;
    }  

}
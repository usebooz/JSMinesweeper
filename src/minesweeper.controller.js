'use strict';

import MinesweeperModel from './minesweeper.model.js';
import MinesweeperView from './minesweeper.view.js';

export default class MinesweeperController {

    /**
     * 
     * @param {MinesweeperView} view
     * @param {MinesweeperModel} model
     */
    constructor(view, model) {
        /**
         * @type {MinesweeperView} 
         * */
        this.view = view;
        /**
         * @type {MinesweeperModel} 
         * */
        this.model = model;
        this.view.onClickLevel = this.clickLevel.bind(this);
        this.view.onClickRestart = this.clickRestart.bind(this);
        this.view.onClickCell = this.clickCell.bind(this);
        this.view.onContextCell = this.contextCell.bind(this);
        this.timer = null;
    }

    initialize() {
        this.model.initialize(this.view.checkedLevel);
        this.view.initialize(this.model.grid, this.model.game);
        clearInterval(this.timer);
        this.timer = setInterval(() => this.view.renderGame(this.model.game), 1000);
        setTimeout(() => clearInterval(this.timer), 1000000);
    }

    /** 
     * @param {Event} event 
     */
    clickLevel(event) {
        this.initialize();
    }

    /** 
     * @param {Event} event 
     */
    clickRestart(event) {
        this.initialize();
    }

    /** 
     * @param {Event} event 
     */
    clickCell(event) {
        if (this.model.isGameLost() || this.model.isGameWon()) {
            return;
        }
        let cell = this.view.getCell(event.target);
        if (this.model.isCellFlag(cell)) {
            return;
        }      
        if (this.model.isCellOpen(cell)) {
            if (!this.model.isMinesFound(cell)) return; 
            this.model.openCellsAround(cell, true, true); 
        } else {
            this.model.openCell(cell);
        }
        if (this.model.isGameLost()) {
            this.model.openMines();
            this.model.openFlags();
            clearInterval(this.timer);
        }
        if (this.model.isGameWon()) {
            this.model.flagMines();
            clearInterval(this.timer);
        }
        this.view.renderGame(this.model.game);
        this.view.renderGrid(this.model.grid);
    }

    /** 
     * @param {Event} event 
     */
    contextCell(event) {
        event.preventDefault();
        if (this.model.isGameLost() || this.model.isGameWon()) {
            return;
        }
        let cell = this.view.getCell(event.target);
        if (this.model.isCellOpen(cell)) {
            return;
        }
        this.model.flagCell(cell);
        this.view.renderGame(this.model.game);
        this.view.renderGrid(this.model.grid);
    }

}
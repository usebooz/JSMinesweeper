'use strict';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import MinesweeperController from './minesweeper.controller.js';
import MinesweeperModel from './minesweeper.model.js';
import MinesweeperView from './minesweeper.view.js';

function component() {
    const minesweeperElement = document.createElement('div');
    new MinesweeperController(new MinesweeperView(minesweeperElement), new MinesweeperModel()).initialize();
    return minesweeperElement;
}

document.body.appendChild(component());
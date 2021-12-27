const { Matrix } = require('../../utils/matrix'),
    { colors, format, reset } = require('../../utils/clformat');

class Game {
    constructor(options = {rows = 0, cols = 0, bombs = 0}) {
        let defaultState = {
            isOpen: false,
            isFlagged: false,
            isMine: false,
            minesNearby: 0
        }
        this.board = new Matrix(options.rows || 7, options.cols || options.rows || 7, defaultState);
        this.board.state = {
            firstMove: true,
            ongoing: true,
            won: false
        }

        this.generate(options?.bombs || ((options.rows || 7)*(options.cols || options.rows || 7)/3.30))
    }

    freeSquares() {
        let freeSquares;
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                if (!this.board.data[y][x].isMine) freeSquares.push({x,y})
            }
        }
        return freeSquares;
    }

    generate(bombs) {
        let freeSquares = this.freeSquares();

        for (bombs; bombs > 0; bombs--) {
            let random = Math.floor(Math.random()*freeSquares.length);

            let pos = freeSquares.splice(random, 1)[0]
            this.board.data[pos.y][pos.x].isMine = true;
        }
        this.calculateNeaby()
    }

    calculateNeaby() {
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                this.board.data[y][x].minesNearby = 0;
                if (!this.board.data[y][x].isMine) {
                    let positions2check = [
                        {x: x-1, y: y-1},{x, y: y-1},{x: x+1, y: y-1},
                        {x: x-1, y},                ,{x: x+1, y},
                        {x: x-1, y: y+1},{x, y: y+1},{x: x+1, y: y+1}
                    ]

                    for(let pos of positions2check) {
                        if (this.board.data?.[pos.y]?.[pos.x].isMine) {
                            this.board.data[y][x].minesNearby++
                        }
                    }
                }
            }
        }
    }

    open(x, y) {
        if (!this.board.state.ongoing) return;
        if (this.board.data[y][x].isOpen) return; // can't open already open squares
        if (this.board.data[y][x].isFlagged) return; // can't open flagged squares
        if (this.board.data[y][x].isMine) {
            if (this.board.state.firstMove) {
                //move bomb if first move is a mine
                let freeSquares = this.freeSquares();

                this.board.data[y][x].isMine = false;
                let movespot = emptySquares[Math.floor(Math.random()* freeSquares.length)];
                this.board.data[movespot.y][movespot.y].isMine = true;
                this.calculateNeaby()
            } else {
                this.board.state.ongoing = false
            }
        }
        
        this.board.data[y][x].isOpen = true
        if (this.board.data[y][x].minesNearby === 0) this.cascadeOpen(x, y)
        this.checkState()
    }

    cascadeOpen(x, y) {
        let positions2open = [
            {x: x-1, y: y-1},{x, y: y-1},{x: x+1, y: y-1},
            {x: x-1, y},                 {x: x+1, y},
            {x: x-1, y: y+1},{x, y: y+1},{x: x+1, y: y+1}
        ]

        for (let pos of positions2open) {
            if (this.board.data?.[pos.y]?.[pos.x].isOpen === false) {
                this.board.data[pos.y][pos.x].isOpen = true
                if (this.board.data?.[pos.y]?.[pos.x].minesNearby === 0) this.cascadeOpen(pos.x, pos.y)
            }
        }
    }

    flag(x, y) {
        if (!this.board.state.ongoing) return;
        this.board.data[y][x].isFlagged = this.board.data[y][x].isFlagged ? false : true
    }

    checkState() {
        let squaresNotOpen = new Array();
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                if (!this.board.data[y][x].isMine && this.board.data[y][x].isOpen) squaresNotOpen.push({x,y})
            }
        }

        if (squaresNotOpen.length == 0) {
            this.board.state.ongoing = false;
            this.board.state.won = true;
        }
    }
}

module.exports = {
    Game
}
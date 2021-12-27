const { Matrix } = require('../../utils/matrix'),
    { colors, format, reset } = require('../../utils/clformat');

class Game {
    constructor(options) {
        let defaultState = {
            isOpen: false,
            isFlagged: false,
            isMine: false,
            minesNearby: 0
        }
        this.board = new Matrix((options?.rows || 7), (options?.cols || options?.rows || 7), defaultState);
        this.board.state = {
            firstMove: true,
            ongoing: true,
            won: false
        }

        this._generate(Math.round(options?.bombs || ((options?.rows || 7)*(options?.cols || options?.rows || 7)/3.30)))
    }

    flag(x, y) {
        if (!this.board.state.ongoing) return;
        this.board.data[y][x].isFlagged = this.board.data[y][x].isFlagged ? false : true
    }

    open(x, y) {
        if (!this.board.state.ongoing) return;
        if (this.board.data[y][x].isOpen) return; // can't open already open squares
        if (this.board.data[y][x].isFlagged) return; // can't open flagged squares
        if (this.board.data[y][x].isMine) {
            if (this.board.state.firstMove) {
                //move bomb if first move is a mine
                let freeSquares = this._freeSquares();

                this.board.data[y][x].isMine = false;
                let moveSpot = freeSquares[Math.floor(Math.random()* freeSquares.length)];
                this.board.data[moveSpot.y][moveSpot.y].isMine = true;
                this._calculateNearby()
            } else {
                this.board.state.ongoing = false
            }
        }
        
        this.board.data[y][x].isOpen = true
        if (this.board.data[y][x].minesNearby === 0) this._cascadeOpen(x, y)
        this._checkState()
    }

    render() {
        let render = `${this.board.ongoing ? `🟩` : `🟥`}`,
            y = this.board.data.length,
            x = this.board.data?.[0].length
        
        //if board got 0 rows or 0 columns return error
        if (!x || !y) return `Error generating the board preview`

        render += [`🇦`,`🇧`,`🇨`,`🇩`,`🇪`,`🇫`,`🇬`,`🇭`,`🇮`].slice(0, x).join("\u200B") + "\n" // \u200B zero width char

        for (let i = 0; i < y; i++) {
            render += [`1️⃣`,`2️⃣`,`3️⃣`,`4️⃣`,`5️⃣`,`6️⃣`,`7️⃣`,`8️⃣`,`9️⃣`][i]

            for (let j = 0; j < x; j++) {
                let curTile = this.board.data[i][j]
                
                if (this.board.state.ongoing) {
                    render += curTile.isOpen ? (curTile.isMine ? "💥" : [`🟦`,`1️⃣`,`2️⃣`,`3️⃣`,`4️⃣`,`5️⃣`,`6️⃣`,`7️⃣`,`8️⃣`,`9️⃣`][curTile.minesNearby]) : "⬛"
                } else render += curTile.isMine ? "💣" : (curTile.isOpen ? [`🟦`,`1️⃣`,`2️⃣`,`3️⃣`,`4️⃣`,`5️⃣`,`6️⃣`,`7️⃣`,`8️⃣`,`9️⃣`][curTile.minesNearby] : "⬛")
            }

            render += "\n"
        }

        return render;
    }

    _calculateNearby() {
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                this.board.data[y][x].minesNearby = 0;
                if (!this.board.data[y][x].isMine) {
                    let positions2check = [
                        {x: x-1, y: y-1},{x, y: y-1},{x: x+1, y: y-1},
                        {x: x-1, y},                {x: x+1, y},
                        {x: x-1, y: y+1},{x, y: y+1},{x: x+1, y: y+1}
                    ]

                    for(let pos of positions2check) {
                        if (this.board.data?.[pos.y]?.[pos.x]?.isMine) {
                            this.board.data[y][x].minesNearby++
                        }
                    }
                }
            }
        }
    }

    _cascadeOpen(x, y) {
        let positions2open = [
            {x: x-1, y: y-1},{x, y: y-1},{x: x+1, y: y-1},
            {x: x-1, y},                 {x: x+1, y},
            {x: x-1, y: y+1},{x, y: y+1},{x: x+1, y: y+1}
        ]

        for (let pos of positions2open) {
            if (this.board.data?.[pos.y]?.[pos.x]?.isOpen === false) {
                this.board.data[pos.y][pos.x].isOpen = true
                if (this.board.data?.[pos.y]?.[pos.x].minesNearby === 0) this._cascadeOpen(pos.x, pos.y)
            }
        }
    }

    _checkState() {
        let squaresNotOpen = new Array(),
            bombsNotFlagged = new Array();
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                // check for tiles that aren't bombs and not open
                if (!this.board.data[y][x].isMine && this.board.data[y][x].isOpen) squaresNotOpen.push({x,y})

                //check for bomb tiles not flagged
                if (this.board.data[y][x].isMine && !this.board.data[y][x].isFlagged) bombsNotFlagged.push({x,y})
            }
        }

        if (squaresNotOpen.length == 0 || bombsNotFlagged.length == 0) {
            this.board.state.ongoing = false;
            this.board.state.won = true;
        }
    }

    _freeSquares() {
        let freeSquares = new Array();
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                if (!this.board.data[y][x].isMine) freeSquares.push({x,y})
            }
        }
        return freeSquares;
    }

    _generate(bombs) {
        let freeSquares = this._freeSquares();

        for (bombs; bombs > 0; bombs--) {
            let random = Math.floor(Math.random()*freeSquares.length);

            let pos = freeSquares.splice(random, 1)[0]
            this.board.data[pos.y][pos.x].isMine = true;
        }
        this._calculateNearby()
    }
}

module.exports = {
    Game
}
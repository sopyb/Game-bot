const { Matrix } = require('../../utils/matrix'),
    { emoji } = require("../../sources/2048")

class Game {
    constructor(options) {
        this.board = new Matrix(4, 4);
        this.board.topTile = 0;
        this.board.score = 0;

        this.state = {ongoing: true, win: false};
        
        this._start(options?.start ?? 2)
    }


    moveLeft() {
        let cache = JSON.stringify(this.board.data)

        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                let copyX = x+1
                while (copyX < this.board.data[y].length) {
                    if (this.board.data[y][copyX] != 0 && this.board.data[y][x] == 0) {
                        this.board.data[y][x] = this.board.data[y][copyX]
                        this.board.data[y][copyX] = 0
                    } else if (this.board.data[y][copyX] == this.board.data[y][x]) {
                        this.board.data[y][x] = this.board.data[y][copyX]*2
                        this.board.score += this.board.data[y][copyX]
                        this.board.data[y][copyX] = 0
                        break
                    } else if (this.board.data[y][copyX] != 0) break;
                    copyX++;
                }
            }
        }

        if (JSON.stringify(cache.data) != JSON.stringify(this.board.data)) this._summonBlock() //if board state changed summon new block
    }

    moveRight() {
        let cache = JSON.stringify(this.board.data)

        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = this.board.data[y].length-1; x >= 0 ; x--) {
                let copyX = x-1
                while (copyX >= 0) {
                    if (this.board.data[y][copyX] != 0 && this.board.data[y][x] == 0) {
                        this.board.data[y][x] = this.board.data[y][copyX]
                        this.board.data[y][copyX] = 0
                    } else if (this.board.data[y][copyX] == this.board.data[y][x]) {
                        this.board.data[y][x] = this.board.data[y][copyX]*2
                        this.board.score += this.board.data[y][copyX]
                        this.board.data[y][copyX] = 0
                        break
                    } else if (this.board.data[y][copyX] != 0) break;
                    copyX--;
                }
            }
        }

        if (JSON.stringify(cache.data) != JSON.stringify(this.board.data)) this._summonBlock() //if board state changed summon new block
    }

    moveUp() {
        let cache = JSON.stringify(this.board.data)

        for (let x = 0; x < this.board.data[0].length; x++) {
            for (let y = 0; y < this.board.data.length ; y++) {
                let copyY = y+1
                while (copyY < this.board.data[y].length) {
                    if (this.board.data[copyY][x] != 0 && this.board.data[y][x] == 0) {
                        this.board.data[y][x] = this.board.data[copyY][x]
                        this.board.data[copyY][x] = 0
                    } else if (this.board.data[copyY][x] == this.board.data[y][x]) {
                        this.board.data[y][x] = this.board.data[copyY][x]*2
                        this.board.score += this.board.data[copyY][x]
                        this.board.data[copyY][x] = 0
                        break
                    } else if (this.board.data[copyY][x] != 0) break;
                    copyY++;
                }
            }
        }

        if (cache != JSON.stringify(this.board.data)) this._summonBlock() //if board state changed summon new block
    }

    moveDown() {
        let cache = JSON.stringify(this.board.data)

        for (let x = 0; x < this.board.data[0].length; x++) {
            for (let y = this.board.data.length-1; y >= 0 ; y--) {
                let copyY = y-1
                while (copyY >= 0) {
                    if (this.board.data[copyY][x] != 0 && this.board.data[y][x] == 0) {
                        this.board.data[y][x] = this.board.data[copyY][x]
                        this.board.data[copyY][x] = 0

                    } else if (this.board.data[copyY][x] == this.board.data[y][x]) {
                        this.board.data[y][x] = this.board.data[copyY][x]*2
                        this.board.score += this.board.data[copyY][x]
                        this.board.data[copyY][x] = 0
                        break
                    } else if (this.board.data[copyY][x] != 0) break;
                    copyY--;
                }
            }
        }

        if (JSON.stringify(cache.data) != JSON.stringify(this.board.data)) this._summonBlock() //if board state changed summon new block
    }

    render() {
        let render = ``
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                render += emoji[Math.log(this.board.data[y][x] || 1)/Math.log(2)]
            }
            render += `\n`
        }
        return render;
    }

    _checkUpdate(cache) {
        if (cache.data) a
    }

    _checkWin() {
        this.board.topTile = Math.max.apply(null, this.board.data.map(e => Math.max.apply(null, e)))
        if (this.board.topTile >= 2048) this.state.win = true
    }

    _start(blocks) {
        for (blocks; blocks > 0 ; blocks--) {
            this._summonBlock();
        }
    }

    _summonBlock() {
        let freeSpots = new Array(), x, y, value;

        //checks if there are any free spots
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                if (this.board.data[y][x] == 0) {
                    freeSpots.push({x, y});
                }
            }
        }

        if (freeSpots.length != 0) {
            let random = freeSpots[Math.floor(Math.random()*freeSpots.length)]
            this.board.data[random.y][random.x] = Math.random() < 0.9 ? 2 : 4
        } else {
            this.state.ongoing = false
        }

        if (this.board.topTile < 2048) this._checkWin()
    }
}

module.exports = {
    Game
}
const { Matrix } = require('../utils/matrix'),
    { colors, format, reset } = require('../utils/clformat'),
    validmoves = ["up", "left", "right", "down"];

class Game {
    constructor(options) {
        this.debug = false
        this.board = new Matrix(4, 4);
        this.score = 0
        this.highestblock = 0
        this.state = {ongoing: true, won: false, lost: false}
        if(options.debug) this.debug = true;
    }

    start() {
        if(this.debug) console.log(`${colors.purple}Debug:${reset} start: Generating start blocks.`);
        this.summonBlock(); this.summonBlock();
        if(this.debug) {
            console.log(`${colors.purple}Debug:${reset} start: Blocks generated. Board state:`);
            console.log(this.board.data)
        }
    }

    summonBlock() {
        let freeSpots = new Array(), x, y, value;

        if(this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Checking for free spots.`)
        //checks if there are any free spots
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                if(!this.board.data[y][x]) {
                    freeSpots.push({x: x, y: y});
                }
            }
        }

        //stop if no free spots
        if (!freeSpots[0]) {
            return console.error(`${colors.red}Error:${reset} Can't generate block if the board is full`);
        }
        
        if(this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Generating Y coordinate based on free spots.`)
        //determine Y pos of block
        let openYcoords = new Array();
        for (let spot of freeSpots) {
            if (!openYcoords.includes(spot.y)) {
                openYcoords.push(spot.y)
            }
        }
        y = openYcoords[Math.floor(Math.random()*openYcoords.length-1)]

        if(this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Generating X coordinate based on free spots at ${colors.green}Y=${y}${reset}.`)
        //determine X pos of block
        let openXcoords = new Array();
        for (let spot of freeSpots) {
            if (spot.y === y) {
                openXcoords.push(spot.x)
            }
        }
        x = openXcoords[Math.floor(Math.random()*openXcoords.length-1)]

        if(this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Generating block value.`)
        value = Math.random() < 0.9 ? 2 : 4;

        
        if(this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Setting block on board at ${colors.green}X=${x} Y=${y}${reset} to ${colors.green}value ${value}${reset}.`)
        this.board.data[y][x] = value
    }

    getData() {
        return {
            board: this.board.data,
            score: this.score,
            highestblock: this.highestblock,
            state: this.state
        }
    }

    moveLeft() {
        if(this.debug) console.log(`${colors.purple}Debug:${reset} moveLeft: Started moving blocks left.`);
        for(let y = 0; y < this.board.data.length; y++) {
            this.board.moveLeft(y)
            if(this.debug) console.log(`${colors.purple}Debug:${reset} moveLeft: Moved to the left elements at ${colors.green}Y=${y} (${this.board.data[y]})${reset}.`);
        }
    }

    moveRight() {
        if(this.debug) console.log(`${colors.purple}Debug:${reset} moveRight: Started moving blocks right.`);
        for(let y = 0; y < this.board.data.length; y++) {
            this.board.moveRight(y)
            if(this.debug) console.log(`${colors.purple}Debug:${reset} moveLeft: Moved to the right elements at ${colors.green}Y=${y} (${this.board.data[y]})${reset}.`);

        }
    }

    moveUp() {
        if(this.debug) console.log(`${colors.purple}Debug:${reset} moveUp: Started moving blocks up.`);
        for(let x = 0; x < this.board.data[0].length; x++) {
            this.board.moveUp(x)
            if(this.debug) console.log(`${colors.purple}Debug:${reset} moveUp: Moved to the up elements at ${colors.green} X=${x} (${this.represent || `Data missing`})${reset}.`);

        }
    }

    moveDown() {
        if(this.debug) console.log(`${colors.purple}Debug:${reset} moveDown: Started moving blocks down.`);
        for(let x = 0; x < this.board.data[0].length; x++) {
            this.board.moveDown(x)
            if(this.debug) console.log(`${colors.purple}Debug:${reset} moveDown: Moved to the down elements at ${colors.green}X=${x} (${this.represent || `Data missing`})${reset}.`);

        }
    }
}

module.exports = {
    Game
}
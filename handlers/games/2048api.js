const { Matrix } = require('../../utils/matrix'),
    { colors, format, reset } = require('../../utils/clformat'),
    validmoves = ["up", "left", "right", "down"];

class Game {
    constructor(options) {
        this.board = new Matrix(4, 4);
        this.allowedMoves = {
            left: true,
            right: true,
            up: true,
            down: true
        };
        this.highestblock = 0;
        this.score = 0;
        this.state = {ongoing: true, won: false, lost: false};
        if (options.debug) this.debug = true;
    }

    start() {
        if (this.debug) console.log(`${colors.purple}Debug:${reset} start: Generating start blocks.`);
        this.summonBlock(); this.summonBlock();
        if (this.debug) {
            console.log(`${colors.purple}Debug:${reset} start: Blocks generated. Board state:`);
            console.log(this.board.data)
        }
    }

    summonBlock() {
        let freeSpots = new Array(), x, y, value;

        if (this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Checking for free spots.`)
        //checks if there are any free spots
        for (let y = 0; y < this.board.data.length; y++) {
            for (let x = 0; x < this.board.data[y].length; x++) {
                if (!this.board.data[y][x]) {
                    freeSpots.push({x: x, y: y});
                }
            }
        }

        //stop if no free spots
        if (!freeSpots[0]) {
            return console.error(`${colors.red}Error:${reset} Can't generate block if the board is full`);
        }
        
        if (this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Generating Y coordinate based on free spots.`);
        //determine Y pos of block
        let openYcoords = new Array();
        for (let spot of freeSpots) {
            if (!openYcoords.includes(spot.y)) {
                openYcoords.push(spot.y)
            }
        }
        y = openYcoords[Math.floor(Math.random()*(openYcoords.length-1))]

        if (this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Generating X coordinate based on free spots at ${colors.green}Y=${y}${reset}.`);
        //determine X pos of block
        let openXcoords = freeSpots.filter(k => k.y === y).map(k => k.x);
        x = openXcoords[Math.floor(Math.random()*(openXcoords.length-1))]

        if (this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Generating block value.`);
        value = Math.random() < 0.9 ? 2 : 4;

        
        if (this.debug) console.log(`${colors.purple}Debug:${reset} summonBlock: Setting block on board at ${colors.green}X=${x} Y=${y}${reset} to ${colors.green}value ${value}${reset}.`);
        this.board.data[y][x] = value;
        this.allowedMoves = this.checkMovement();
        if (this.highestblock < value) {
            if (this.debug) console.log(`${colors.purple}Debug:${reset} New highest block updating ${colors.green}highestblock to ${value}${reset}.`);
            this.highestblock = value;
        }
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
        console.log(this);
        console.log(this.allowedMoves)
        if (!this.allowedMoves.left) return;
        if (this.debug) console.log(`${colors.purple}Debug:${reset} moveLeft: Started moving blocks left.`);
        for (let y = 0; y < this.board.data.length; y++) {
            this.board.moveLeft(y)

            //merging left
            let change = false;
            for (let x = 0; x < this.board.data[y].length-1; x++) {
                if (this.board.data[y][x] === this.board.data[y][x + 1] != 0) {
                    this.board.data[y][x] += this.board.data[y][x + 1];
                    this.board.data[y][x + 1] = 0;
                    this.score += this.board.data[y][x];
                    if (this.highestblock < this.board.data[y][x]) {
                        if (this.debug) console.log(`${colors.purple}Debug:${reset} New highest block updating ${colors.green}highestblock to ${this.board.data[y][x]}${reset}.`);
                        this.highestblock = this.board.data[y][x];
                    }
                    x++;
                    if (!change) change = true;
                }
            }
            if (change) this.board.moveLeft(y)
            if (this.debug) console.log(`${colors.purple}Debug:${reset} moveLeft: Moved and merged elements to the left at ${colors.green}Y=${y} (${this.board.data[y] || `Data missing`})${reset}.`);
        }
        this.allowedMoves = this.checkMovement()
        if (Object.keys(this.allowedMoves).map(k => this.allowedMoves[k]).filter(k => k).length) { 
            this.summonBlock();
        } else {
            this.state.ongoing = false
        }
    }

    moveRight() {
        if (!this.allowedMoves.right) return;
        if (this.debug) console.log(`${colors.purple}Debug:${reset} moveRight: Started moving blocks right.`);
        for (let y = 0; y < this.board.data.length; y++) {
            this.board.moveRight(y)

            //merging right
            let change = false;
            for (let x = this.board.data[y].length-1; x > 1; x--) {
                if (this.board.data[y][x] === this.board.data[y][x - 1] != 0) {
                    this.board.data[y][x] += this.board.data[y][x - 1];
                    this.board.data[y][x - 1] = 0;
                    this.score += this.board.data[y][x];
                    if (this.highestblock < this.board.data[y][x]) {
                        if (this.debug) console.log(`${colors.purple}Debug:${reset} New highest block updating ${colors.green}highestblock to ${this.board.data[y][x]}${reset}.`);
                        this.highestblock = this.board.data[y][x];
                    }
                    x--;
                    if (!change) change = true;
                }
            }
            if (change) this.board.moveRight(y)
            if (this.debug) console.log(`${colors.purple}Debug:${reset} moveRight: Moved and merged elements to the left at ${colors.green}Y=${y} (${this.board.data[y] || `Data missing`})${reset}.`);
        }
        this.allowedMoves = this.checkMovement()
        if (Object.keys(this.allowedMoves).map(k => this.allowedMoves[k]).filter(k => k).length) { 
            this.summonBlock();
        } else {
            this.state.ongoing = false
        }
    }

    moveUp() {
        if (!this.allowedMoves.up) return;
        if (this.debug) console.log(`${colors.purple}Debug:${reset} moveUp: Started moving blocks up.`);
        for (let x = 0; x < this.board.data[0].length; x++) {
            this.board.moveUp(x)

            //merging up
            let change = false;
            for (let y = 0; y < this.board.data.length - 1; y++) {
                if (this.board.data[y][x] === this.board.data[y + 1][x] != 0) {
                    this.board.data[y][x] += this.board.data[y + 1][x];
                    this.board.data[y + 1][x] = 0;
                    this.score += this.board.data[y][x];
                    if (this.highestblock < this.board.data[y][x]) {
                        if (this.debug) console.log(`${colors.purple}Debug:${reset} New highest block updating ${colors.green}highestblock to ${this.board.data[y][x]}${reset}.`);
                        this.highestblock = this.board.data[y][x];
                    };
                    y++;
                    if (!change) change = true;
                }
            }
            if (change) this.board.moveUp(x)
            if (this.debug) console.log(`${colors.purple}Debug:${reset} moveUp: Moved and merged elements up at ${colors.green} X=${x} (${/*data representation || */`Data missing`})${reset}.`);
        }
        this.allowedMoves = this.checkMovement()
        if (Object.keys(this.allowedMoves).map(k => this.allowedMoves[k]).filter(k => k).length) { 
            this.summonBlock();
        } else {
            this.state.ongoing = false
        }
    }

    moveDown() {
        if (!this.allowedMoves.down) return;
        if (this.debug) console.log(`${colors.purple}Debug:${reset} moveDown: Started moving blocks down.`);
        for (let x = 0; x < this.board.data[0].length; x++) {
            this.board.moveDown(x)
            //merging up
            let change = false;
            for (let y = this.board.data.length - 1; y > 1; y--) {
                if (this.board.data[y][x] === this.board.data[y - 1][x] != 0) {
                    this.board.data[y][x] += this.board.data[y - 1][x];
                    this.board.data[y - 1][x] = 0;
                    this.score += this.board.data[y][x];
                    if (this.highestblock < this.board.data[y][x]) {
                        if (this.debug) console.log(`${colors.purple}Debug:${reset} New highest block updating ${colors.green}highestblock to ${this.board.data[y][x]}${reset}.`);
                        this.highestblock = this.board.data[y][x];
                    };
                    y--;
                    if (!change) change = true;
                }
            }
            if (change) this.board.moveDown(x);
            if (this.debug) console.log(`${colors.purple}Debug:${reset} moveDown: Moved and merged elements down at ${colors.green}X=${x} (${/*data representation || */`Data missing`})${reset}.`)
        }
        this.allowedMoves = this.checkMovement()
        if (Object.keys(this.allowedMoves).map(k => this.allowedMoves[k]).filter(k => k).length) { 
            this.summonBlock();
        } else {
            this.state.ongoing = false
        }
    }

    checkMovement() {
        let data = this.board.data,
            allowedMoves = {
                left: false,
                right: false,
                up: false,
                down: false
            };
        
        // checking the x axis for left/right move validation
        if(this.debug) console.log(`${colors.purple}Debug:${reset} checkMovement: Checking the left/right availability on the x axis`)
        for (let y = 0; y < data.length; y++) {
            //check if the sides are empty
            if (data[y][0] && !allowedMoves.left) allowedMoves.left = true;
            if (data[y][data[y].length-1] && !allowedMoves.right) allowedMoves.right = true;

            //if not check blocks in the middle
            if (!allowedMoves.left || !allowedMoves.right) {

                for (let x = 1; x < data[y].length-1; x++) {
                    //if empty block in the middle move allowed
                    if (!data[y][x]) {
                        if (!allowedMoves.left) allowedMoves.left = true
                        if (!allowedMoves.right) allowedMoves.right = true
                        break;
                    }

                    //check if blocks can be merged
                    if (data[y][x] === data[y][x-1] || data[y][x] === data[y][x+1]) { // no need for !=0 checked 
                        if (!allowedMoves.left) allowedMoves.left = true
                        if (!allowedMoves.right) allowedMoves.right = true
                        break;
                    }
                    
                }
            }
            // if both have been already validated break the loop
            if (allowedMoves.left && allowedMoves.right) break;
        }
        if(this.debug) console.log(`${colors.purple}Debug:${reset} checkMovement: Done searching x axis moving left ${colors.green + allowedMoves.left ? `allowed` : `forbidden`+reset}, moving right ${colors.green + allowedMoves.right ? `allowed` : `forbidden`+reset}`)

        // checking the y axis for up/down move validation
        if(this.debug) console.log(`${colors.purple}Debug:${reset} checkMovement: Checking the up/down availability on the y axis`)
        for(let x = 0; x < data[0].length; x++) {
            //check if the sides are empty
            if (data[0][x] && !allowedMoves.up) allowedMoves.up = true;
            if (data[data.length-1][x] && !allowedMoves.down) allowedMoves.down = true;

            for (let y = 1; y < data.length - 1; y++) {
                //check for open spots in the middle
                if (!data[y][x]) {
                    if (!allowedMoves.up) allowedMoves.up = true
                    if (!allowedMoves.down) allowedMoves.down = true
                    break;
                }

                //check if blocks can be merged
                if (data[y][x] === data[y - 1][x] || data[y][x] === data[y + 1][x]) { 
                    if (!allowedMoves.up) allowedMoves.up = true
                    if (!allowedMoves.down) allowedMoves.down = true
                    break;
                }
            }
            // if both have been already validated break the loop
            if (allowedMoves.up && allowedMoves.down) break;
        }
        if(this.debug) console.log(`${colors.purple}Debug:${reset} checkMovement: Done searching x axis moving up ${colors.green + allowedMoves.up ? `allowed` : `forbidden`+reset}, moving down ${colors.green + allowedMoves.down ? `allowed` : `forbidden`+reset}`)
        this.allowedMoves = allowedMoves;
        return allowedMoves;
    }
}

module.exports = {
    Game
}
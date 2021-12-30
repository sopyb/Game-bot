class Matrix {
    constructor(row, col, obj) {
        this.data = new Array(row);
        for (let i = 0; i < row; i++) {
            this.data[i] = new Array(col)
            for (let j = 0; j < col; j++) {
                if (typeof obj == "object") {
                    this.data[i][j] = Object.assign({}, obj)
                } else this.data[i][j] = obj || 0
            }
        };
    }

    // ⬅ move 
    moveLeft(y) {
        let copyX;
        for (let x = 0; x < this.data[y].length; x++) {
            copyX = x;
            for (copyX; !this.data[y][x] && copyX < this.data[y].length; copyX++) {
                if (this.data[y][copyX]) {
                    this.data[y][x] = this.data[y][copyX]
                    this.data[y][copyX] = 0
                }
            }
        }
    }

    // ➡ move
    moveRight(y) {
        let copyX;
        for (let x = this.data[y].length-1; x >= 0; x--) {
            copyX = x;
            for (copyX; !this.data[y][x] && copyX >= 0; copyX--) {
                if (this.data[y][copyX]) {
                    this.data[y][x] = this.data[y][copyX]
                    this.data[y][copyX] = 0
                }
            }
        }
    }

    // ⬆ move
    moveUp(x) {
        let copyY;
        for (let y = 0; y < this.data.length; y++) {
            copyY = y
            for (copyY; !this.data[y][x] && copyY < this.data.length; copyY++) {
                if(this.data[copyY][x]) {
                    this.data[y][x] = this.data[copyY][x]
                    this.data[copyY][x] = 0

                }
            }
        }
    }

    // ⬇ move
    moveDown(x) {
        let copyY;
        for (let y = this.data.length-1; y >= 0; y--) {
            copyY = y
            for (copyY; !this.data[y][x] && copyY >= 0; copyY--) {
                if(this.data[copyY][x]) {
                    this.data[y][x] = this.data[copyY][x]
                    this.data[copyY][x] = 0
                }
            }
        }
    }
}

module.exports = {
    Matrix
}
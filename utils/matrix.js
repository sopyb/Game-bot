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
}

module.exports = {
    Matrix
}
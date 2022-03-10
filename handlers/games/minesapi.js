const { Matrix } = require("../../utils/matrix");

class Game {
  constructor(options) {
    const defaultState = {
      isOpen: false,
      isFlagged: false,
      isMine: false,
      minesNearby: 0,
    };
    this.board = new Matrix(
      options?.rows || 7,
      options?.cols || options?.rows || 7,
      defaultState
    );
    this.state = {
      firstMove: true,
      ongoing: true,
      won: false,
    };

    this._generate(
      Math.round(
        options?.bombs ||
          ((options?.rows || 7) * (options?.cols || options?.rows || 7)) / 3.3
      )
    );
  }

  flag(x, y) {
    if (this.board.data[y][x].isOpen) return;
    if (!this.state.ongoing) return;
    this.board.data[y][x].isFlagged = !this.board.data[y][x].isFlagged;
    this._checkState();
  }

  open(x, y) {
    if (!this.state.ongoing) return;
    if (this.board.data[y][x].isOpen) return; // can't open already open squares
    if (this.board.data[y][x].isFlagged) return; // can't open flagged squares
    if (this.board.data[y][x].isMine) {
      if (this.state.firstMove) {
        // move bomb if first move is a mine
        const freeSquares = this._freeSquares();

        this.board.data[y][x].isMine = false;
        const moveSpot =
          freeSquares[Math.floor(Math.random() * freeSquares.length)];
        this.board.data[moveSpot.y][moveSpot.y].isMine = true;
        this._calculateNearby();
      } else {
        this.state.ongoing = false;
      }
    }

    this.board.data[y][x].isOpen = true;
    if (this.board.data[y][x].minesNearby === 0) this._cascadeOpen(x, y);
    this._checkState();
    this.state.firstMove = false;
  }

  render() {
    let render = this.state.ongoing ? "🟩" : "🟥";
    const y = this.board.data.length;
    const x = this.board.data?.[0]?.length;

    // if board got 0 rows or 0 columns return error
    if (!x || !y) return "Error generating the board preview";

    render +=
      ["🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬", "🇭", "🇮"]
        .slice(0, x)
        .join("\u200B") + "\n"; // \u200B zero width char

    for (let i = 0; i < y; i++) {
      render += ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][i];

      for (let j = 0; j < x; j++) {
        const curTile = this.board.data[i][j];

        render += curTile.isFlagged
          ? "🚩"
          : !curTile.isOpen
          ? !this.state.ongoing && curTile.isMine
            ? "💣"
            : "⬛" // if tile not open
          : curTile.isMine
          ? "💥"
          : ["🟦", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][
              curTile.minesNearby
            ]; // if tile open

        // if (this.state.ongoing) {

        //     render += curTile.isOpen ? (curTile.isMine ? "💥" : [`🟦`,`1️⃣`,`2️⃣`,`3️⃣`,`4️⃣`,`5️⃣`,`6️⃣`,`7️⃣`,`8️⃣`,`9️⃣`][curTile.minesNearby]) : "⬛"
        // } else render += curTile.isMine ? "💣" : (curTile.isOpen ? [`🟦`,`1️⃣`,`2️⃣`,`3️⃣`,`4️⃣`,`5️⃣`,`6️⃣`,`7️⃣`,`8️⃣`,`9️⃣`][curTile.minesNearby] : "⬛")
      }

      render += "\n";
    }

    return render;
  }

  _calculateNearby() {
    for (let y = 0; y < this.board.data.length; y++) {
      for (let x = 0; x < this.board.data[y].length; x++) {
        this.board.data[y][x].minesNearby = 0;
        if (!this.board.data[y][x].isMine) {
          const positions2check = [
            { x: x - 1, y: y - 1 },
            { x, y: y - 1 },
            { x: x + 1, y: y - 1 },
            { x: x - 1, y },
            { x: x + 1, y },
            { x: x - 1, y: y + 1 },
            { x, y: y + 1 },
            { x: x + 1, y: y + 1 },
          ];

          for (const pos of positions2check) {
            if (this.board.data?.[pos.y]?.[pos.x]?.isMine) {
              this.board.data[y][x].minesNearby++;
            }
          }
        } else this.board.data[y][x].minesNearby = 9;
      }
    }
  }

  _cascadeOpen(x, y) {
    const positions2open = [
      { x: x - 1, y: y - 1 },
      { x, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x - 1, y },
      { x: x + 1, y },
      { x: x - 1, y: y + 1 },
      { x, y: y + 1 },
      { x: x + 1, y: y + 1 },
    ];

    for (const pos of positions2open) {
      if (this.board.data?.[pos.y]?.[pos.x]?.isOpen === false) {
        this.board.data[pos.y][pos.x].isOpen = true;
        if (this.board.data?.[pos.y]?.[pos.x].minesNearby === 0) {
          this._cascadeOpen(pos.x, pos.y);
        }
      }
    }
  }

  _checkState() {
    const tilesNotOpen = new Array();
    const falseFlagged = new Array();
    for (let y = 0; y < this.board.data.length; y++) {
      for (let x = 0; x < this.board.data[y].length; x++) {
        // check for tiles that aren't bombs and not open
        if (!this.board.data[y][x].isMine && !this.board.data[y][x].isOpen) {
          tilesNotOpen.push({ x, y });
        }

        // check for bomb tiles not flagged
        if (
          (this.board.data[y][x].isMine && !this.board.data[y][x].isFlagged) ||
          (!this.board.data[y][x].isMine && this.board.data[y][x].isFlagged)
        ) {
          falseFlagged.push({ x, y });
        }
      }
    }

    if (tilesNotOpen.length == 0 || falseFlagged.length == 0) {
      this.state.ongoing = false;
      this.state.won = true;
    }
  }

  _freeSquares() {
    const freeSquares = new Array();
    for (let y = 0; y < this.board.data.length; y++) {
      for (let x = 0; x < this.board.data[y].length; x++) {
        if (!this.board.data[y][x].isMine) freeSquares.push({ x, y });
      }
    }
    return freeSquares;
  }

  _generate(bombs) {
    const freeSquares = this._freeSquares();

    for (bombs; bombs > 0; bombs--) {
      const random = Math.floor(Math.random() * freeSquares.length);

      const pos = freeSquares.splice(random, 1)[0];
      this.board.data[pos.y][pos.x].isMine = true;
    }
    this._calculateNearby();
  }
}

module.exports = {
  Game,
};

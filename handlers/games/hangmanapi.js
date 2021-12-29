const dictionary = require('../../sources/hangman.json') // From https://github.com/worldMachine/Hangman

class Game {
    constructor(options) {
        this.word = options?.word || dictionary[Math.floor(Math.random()*(dictionary.length - 1))]
        this.lettersGuessed = []
        this.strikeCount = 0
        
        this.state = {
            ongoing: true,
            win: false
        }
    }

    render() {
        let render = "`"

        this.word.split("").forEach(e => {
            if (this.lettersGuessed.includes(e)) {
                render += e.toUpperCase()
            } else render += "-"
        })

        render += "`\n"
        render += this.state.ongoing ? `\n**Guesses:** \`${this.lettersGuessed.join(" ").toUpperCase() || "None yet"}\`` : this.state.win ? "" : `\n**Solution:** \`${this.word}\``

        return render
    }

    guess(guess) {
        // if game ended return
        if (!this.state.ongoing) return;

        guess = guess.toLowerCase()
        if (guess.length != 1) {
            if(guess == this.word) {
                guess.split("").forEach(e => this.lettersGuessed.push(e));
            } else this.strikeCount++
        } else {
            if (!this.lettersGuessed.includes(guess)) {
                this.lettersGuessed.push(guess)

                if (!this.word.split("").includes(guess)) this.strikeCount++
            }
        }

        this._checkState()
    }

    _checkState() {
        if (this.word.split("").every(e => this.lettersGuessed.includes(e))) {
            this.state = {
                ongoing: false,
                win: true
            }
        } else if (this.strikeCount >= 6) {
            this.state = {
                ongoing: false,
                win: false
            }
        }
    }
}

module.exports = {
    Game
}
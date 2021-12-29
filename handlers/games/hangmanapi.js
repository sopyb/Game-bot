const dictionary = require('../../sources/hangman.json') // From https://github.com/worldMachine/Hangman

class Game {
    constructor(options) {
        this.word = options?.word || dictionary[Math.floor(Math.random()*(dictionary.length - 1))]
        this.lettersGuessed = []
        this.strikeCount = 0
        
        this.state = {
            ongoing: true,
            won: false
        }
    }

    render() {
        let render = ""

        this.word.split("").forEach(e => {
            if (this.lettersGuessed.includes(e)) {
                render += `${e.toUpperCase()} `
            } else render += `- `
        })

        render += this.state.ongoing ? `\n**Guesses:** \`${this.lettersGuessed.toUpperCase().join(", ")}\`` : this.state.won ? "**You guessed the word!**" : `\n**Solution:** \`${this.word}\``

        return render
    }

    guess(guess) {
        // if game ended return
        if (!this.state.ongoing) return;

        guess = guess.toLowerCase()
        if (guess.length != 1) {
            if(guess == word) {
                guess.split("").forEach(e => lettersGuessed.push(e));

                return this.state = {ongoing: false, won: true}
            } else if (guess.length == this.word.length) this.strikeCount++
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
        } else if (this.strikeCount > 6) {
            this.state = {
                ongoing: false,
                won: false
            }
        }
    }
}
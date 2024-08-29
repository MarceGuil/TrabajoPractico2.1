// memory.js

class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    toggleFlip() {
        this.isFlipped = !this.isFlipped;
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.toggle("flipped", this.isFlipped);
    }

    matches(otherCard) {
        return this.name === otherCard.name; // Compara los nombres de las cartas
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
        this.flippedCards = [];
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    reset() {
        this.flipDownAllCards();
        this.shuffleCards(); // Mezclar cartas al reiniciar
        this.render();
    }

    flipDownAllCards() {
        this.cards.forEach((card) => {
            card.isFlipped = false;
            card.toggleFlip(); // Voltear todas las cartas hacia abajo
        });
    }

    render() {
        this.gameBoardElement.innerHTML = ""; // Limpiar el tablero
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), 1000);
            }
        }
    }

    checkForMatch() {
        const [firstCard, secondCard] = this.flippedCards;
        if (firstCard.matches(secondCard)) {
            // Coincidencia encontrada
            this.flippedCards = [];
        } else {
            firstCard.toggleFlip();
            secondCard.toggleFlip();
            this.flippedCards = [];
        }
    }
}

class MemoryGame {
    constructor(board) {
        this.board = board;
        this.board.render(); // Renderizar el tablero
    }

    resetGame() {
        this.board.reset(); // Reiniciar el tablero
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JavaScript.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    // Duplicar cartas
    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);

    const board = new Board(cards);
    const memoryGame = new MemoryGame(board);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});

const View = (() => {
    const domSelector = {
        gameBoard: document.querySelector('#game-container'),
        score: document.getElementById('score'),
        startBtn: document.getElementById('start-btn'),
        timeLeft: document.getElementById('left-time'),
    };
    
    let moleHoles = [];

    const gameInit = () => {
        moleHoles = Array.from({ length: 12 }, () => {
            const hole = document.createElement('div');
            hole.classList.add('hole');
            
            domSelector.gameBoard.appendChild(hole);
            return hole;
        });
    };


    const render = (score, timeLeft, moles, snakes) => {
        domSelector.score.textContent = score;
        domSelector.timeLeft.textContent = timeLeft;
        moleHoles.forEach((hole, index) => {
            hole.style.backgroundImage = moles[index] ? 'url("./assets/mole.jpeg")' : 'none';
            if(moles[index]) {
                hole.classList.add('mole');
            } else {
                hole.classList.remove('mole');
            }

            if (snakes[index]) {
                hole.style.backgroundImage = 'url("./assets/mine.jpeg")';
            }
        });
    }


    const bindStartGame = (handler) => {
        domSelector.startBtn.addEventListener('click', handler);
    };

    const bindWhacMole = (handler) => {
        moleHoles.forEach((hole, index) => {
            hole.addEventListener("click", () => handler(index))
        })
    }
    return {
        domSelector,
        gameInit,
        render,
        bindStartGame,
        bindWhacMole,
    };
})()

const Model = (() => {
    class State {
        constructor() {
            this.score = 0;
            this.timeLeft = 30;
            this.moles = Array(12).fill(false);
            this.snakes = Array(12).fill(false);
        }

        startGame() {
            this.score = 0;
            this.timeLeft = 30;
            this.moles = Array(12).fill(false);
            this.snakes = Array(12).fill(false);
        }

        spawnMole() {
            this.moleHoles = document.querySelectorAll('.mole');
            if (this.moleHoles.length >= 3) return;

            // clear current status
            // this.moles = Array(12).fill(false);
            const randomIndex = Math.floor(Math.random() * 12);

            if (!this.moles[randomIndex]) {
                this.moles[randomIndex] = true;
            }

            setTimeout(() => {
                this.clearMole(randomIndex);
            }, 2000);
        }

        spawnSnake() {
            const randomIndex = Math.floor(Math.random() * 12);
            this.snakes = Array(12).fill(false);
            this.snakes[randomIndex] = true;
            console.log(randomIndex);
        }

        whackMole(index) {
            if (this.moles[index]) {
                this.score += 1;
                this.moles[index] = false;
                this.spawnMole();
                return true;
            }
            return false;
        }

        hitSnake(index) {
            if (this.snakes[index]) {
                this.timeLeft = 0;
                this.snakes = Array(12).fill(true);
                return true;
            } 
            return false;
        }

        clearMole(index) {
            this.moles[index] = false;
        }

        tick() {
            if (this.timeLeft > 0) {
                this.timeLeft -= 1;
                return true;
            }
            return false;
        }
    }

    return { State };

})();

const Controller = ((view,  model) => {
    let gameInterval = null,
        snakeInterval = null;
    const { domSelector, render, gameInit, bindStartGame, bindWhacMole } = view;
    const { State } = model;
    const state = new State();

    const gameStart = () => {
        state.startGame();
        render(state.score, state.timeLeft, state.moles, state.snakes);

        snakeInterval = setInterval(() => {
            state.spawnSnake();
            render(state.score, state.timeLeft, state.moles, state.snakes);
        }, 2000);

        gameInterval = setInterval(() => {
            if (state.tick()) {
                state.spawnMole();
                render(state.score, state.timeLeft, state.moles, state.snakes);
            } else {
                clearInterval(gameInterval);
                clearInterval(snakeInterval);
                alert('Time is Over !');
            }
        }, 1000)

       
    }

    const moleWhack = (index) => {
        if (state.whackMole(index)) {
            render(state.score, state.timeLeft, state.moles, state.snakes);
        }
    }

    const snakeHit = (index) => {
        if (state.hitSnake(index)) {
            render(state.score, state.timeLeft, state.moles, state.snakes);
        }
    };

    const init = () => {
        gameInit();
        bindStartGame(gameStart);
        bindWhacMole((index) => {
            if(state.snakes[index]) {
                snakeHit(index);
            } else {
                moleWhack(index);
            }
        });
    }
    return { init };
})(View, Model)

document.addEventListener("DOMContentLoaded", () => {
    Controller.init();
})
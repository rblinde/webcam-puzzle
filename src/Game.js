import Piece from './Piece';
import Sound from './Sound';
import * as constants from './constants';

class Game {
  constructor(container) {
    // Elements
    this.canvas = document.getElementById(container);
    this.ctx = this.canvas.getContext('2d');
    this.video = document.createElement('video');
    // Data
    this.frame = { cols: 4, rows: 3 }; // 4,3 to match medium setting
    this.pieces = [];
    this.selectedPiece = null;
    this.selectedPieceOffset = {};
    this.isPlaying = false;
    // Initialize webcam
    this.init();
  }


  /**
   * Creates all required event listeners for this game
   */
  addEventListeners() {
    window.addEventListener('resize', () => this.handleResize(), false);

    this.canvas.addEventListener('mousedown', (e) => this.handleMousedown(e), false);
    this.canvas.addEventListener('mousemove', (e) => this.handleMousemove(e), false);
    this.canvas.addEventListener('mouseup', () => this.handleMouseup(), false);

    this.canvas.addEventListener('touchstart', (e) => this.handleMousedown(e), false);
    this.canvas.addEventListener('touchmove', (e) => this.handleMousemove(e), false);
    this.canvas.addEventListener('touchend', () => this.handleMouseup(), false);
  }


  /**
   * Change difficulty by updating rows and cols
   * and create new pieces accordingly
   * @param {String} difficulty
   */
  changeDifficulty(difficulty) {
    const { cols, rows } = constants.DIFFICULTIES[difficulty];
    this.frame.cols = cols;
    this.frame.rows = rows;
    this.pieces = [];
    this.createPieces();
  }


  /**
   * Creates col * row pieces
   */
  createPieces() {
    for (let row = 0; row < this.frame.rows; row++) {
      for (let col = 0; col < this.frame.cols; col++) {
        this.pieces.push(new Piece(row, col, this.frame));
      }
    }
  }


  /**
   * Places pieces in a random position on screen
   */
  randomizePieces() {
    for (const piece of this.pieces) {
      piece.correct = false;
      piece.place(
        Math.random() * (this.canvas.width - piece.width),
        Math.random() * (this.canvas.height - piece.height),
      );
    }
  }


  /**
   * Checks if all pieces are in correct position
   * @returns {Boolean}
   */
  isComplete() {
    return this.pieces.every(piece => piece.correct);
  }


  /**
   * Returns top-most piece in x,y position, if possible
   * @param   {Number} x
   * @param   {Number} y
   * @returns {Piece|null}
   */
  getClickedPiece(x, y) {
    let selectedPiece = null;

    for (const piece of this.pieces) {
      if (
        x >= piece.x &&
        x <= piece.x + piece.width &&
        y >= piece.y &&
        y <= piece.y + piece.height
      ) {
        selectedPiece = piece;
      }
    }

    return selectedPiece;
  }


  /**
   * Resizes canvas and frame when screen size changes
   * and updates size and position of pieces
   */
  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    let resizer = constants.SCALER * Math.min(
      window.innerWidth / this.video.videoWidth,
      window.innerHeight / this.video.videoHeight,
    );

    // Update frame width and position
    this.frame.width = resizer * this.video.videoWidth;
    this.frame.height = resizer * this.video.videoHeight;
    this.frame.x = window.innerWidth / 2 - this.frame.width / 2;
    this.frame.y = window.innerHeight / 2 - this.frame.height / 2;

    // Update pieces with new frame
    for (const piece of this.pieces) {
      piece.update(this.frame);
    }
  }


  /**
   * Detects if a piece is selected and makes it available for moving
   * @param {Event} e
   */
  handleMousedown(e) {
    const event = e.changedTouches ? e.changedTouches[0] : e;
    const { clientX: x, clientY: y } = event;
    const selectedPiece = this.getClickedPiece(x, y);

    if (!selectedPiece || !this.isPlaying) {
      return false;
    }

    this.canvas.classList.toggle('mouse');

    this.pieces = [
      ...this.pieces.filter(piece => piece.x !== selectedPiece.x || piece.y !== selectedPiece.y),
      selectedPiece,
    ];

    this.selectedPiece = selectedPiece;
    this.selectedPiece.correct = false;
    this.selectedPieceOffset = {
      x: x - selectedPiece.x,
      y: y - selectedPiece.y,
    };

  }


  /**
   * Updates position of selected piece based on cursor/touch position
   * @param {Event} e
   */
  handleMousemove(e) {
    if (!this.selectedPiece) {
      return;
    }

    const event = e.changedTouches ? e.changedTouches[0] : e;
    const { clientX: x, clientY: y } = event;

    this.selectedPiece.x = x - this.selectedPieceOffset.x;
    this.selectedPiece.y = y - this.selectedPieceOffset.y;
  }


  /**
   * Checks if piece is placed in correct position
   */
  handleMouseup() {
    if (!this.selectedPiece || !this.isPlaying) {
      return false;
    }

    this.canvas.classList.toggle('mouse');

    if (this.selectedPiece.isClose()) {
      this.selectedPiece.snap();

      if (this.isComplete()) {
        // Restart
        this.isPlaying = false;
        this.playWinSound();
        document.querySelector('.options').classList.toggle('hide');

      } else {
        (new Sound()).play(440, 0.5, 'sine').setFrequency(880, 0.1).stop(0.2);
      }
    }

    this.selectedPiece = null;
    this.selectedPieceOffset = null;
  }


  /**
   * Plays sound when game is over
   */
  playWinSound() {
    (new Sound()).play(440, 0.5, 'sine').stop(0.2);
    (new Sound()).play(880, 0.5, 'sine', 0.15).stop(0.35);
    (new Sound()).play(220, 0.5, 'sine', 0.3).stop(0.5);
    (new Sound()).play(440, 0.5, 'sine', 0.5).stop(0.7);
    (new Sound()).play(220, 0.5, 'sine', 0.65).stop(0.8);
    (new Sound()).play(880, 0.5, 'sine', 0.8).stop(1);
  }


  /**
   * Main draw loop of game: draws frame and pieces
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.rect(this.frame.x, this.frame.y, this.frame.width, this.frame.height);
    this.ctx.stroke();
    this.pieces.forEach(piece => piece.draw(this.ctx, this.frame, this.video));

    requestAnimationFrame(() => this.draw());
  }


  /**
   * Starts a game by randomizing pieces' positions
   */
  start() {
    this.isPlaying = true;
    this.randomizePieces();
  }


  /**
   * Initializes webcam by asking for permission
   */
  init() {
    this.addEventListeners();
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      this.video.srcObject = stream;
      this.video.onloadeddata = () => {
        this.handleResize();
        this.createPieces();
        this.draw();
      };
      this.video.play();
    });
  }
}

export default Game;

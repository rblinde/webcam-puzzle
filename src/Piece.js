import * as helpers from './helpers';

class Piece {
  constructor(row, col, frame) {
    this.row = row;
    this.col = col;
    // Initially, place piece at correct position
    this.x = frame.x + frame.width * (this.col / frame.cols);
    this.y = frame.y + frame.height * (this.row / frame.rows);
    this.correct = true;

    this.update(frame);
  }


  /**
   * Update size and correct position when window changes
   * @param {Object} frame
   */
  update(frame) {
    this.width = frame.width / frame.cols;
    this.height = frame.height / frame.rows;
    this.correctX = frame.x + frame.width * (this.col / frame.cols);
    this.correctY = frame.y + frame.height * (this.row / frame.rows);

    if (this.correct) {
      this.x = this.correctX;
      this.y = this.correctY;
    }
  }


  /**
   * Place piece at x,y location
   * @param {Number} x
   * @param {Number} y
   */
  place(x, y) {
    this.x = x;
    this.y = y;
  }


  /**
   * Draws piece in the right location
   * @param {HTMLContext} ctx
   * @param {Object}      frame
   * @param {MediaStream} video
   */
  draw(ctx, frame, video) {
    ctx.drawImage(
      video,
      this.col * (video.videoWidth / frame.cols),
      this.row * (video.videoHeight / frame.rows),
      video.videoWidth / frame.cols,
      video.videoHeight / frame.rows,
      this.x,
      this.y,
      this.width,
      this.height,
    );

    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#555';
    ctx.stroke();
  }


  /**
   * Determines if piece is close enough to snap in the correct spot
   * @returns {Boolean}
   */
  isClose() {
    return helpers.distance(this.x, this.y, this.correctX, this.correctY) < this.width / 5;
  }


  /**
   * Places piece in correct position
   */
  snap() {
    this.x = this.correctX;
    this.y = this.correctY;
    this.correct = true;
  }
}

export default Piece;

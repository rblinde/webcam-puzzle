/**
 * Original JavaScript code by Chirp Internet: chirpinternet.eu
 * Please acknowledge use of this code by including this header.
 */
class Sound {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.connect(this.audioCtx.destination);
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.connect(this.gainNode);
  }


  setFrequency(val, when = 0) {
    this.oscillator.frequency.setValueAtTime(val, this.audioCtx.currentTime + when);
    return this;
  }


  setVolume(val, when = 0) {
    this.gainNode.gain.exponentialRampToValueAtTime(val, this.audioCtx.currentTime + when);
    return this;
  }


  setWaveType(waveType) {
    this.oscillator.type = waveType;
    return this;
  }


  play(freq, vol, wave, when = 0.02) {
    this.setFrequency(freq);
    this.setWaveType(wave);
    this.setVolume(1 / 1000, when - 0.02);
    this.oscillator.start(when - 0.02);
    this.setVolume(vol, when);
    return this;
  }


  stop(when = 0.05) {
    this.gainNode.gain.setTargetAtTime(1 / 1000, this.audioCtx.currentTime + when - 0.05, 0.02);
    this.oscillator.stop(this.audioCtx.currentTime + when);
    return this;
  }
}

export default Sound;

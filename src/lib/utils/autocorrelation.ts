// https://github.com/cwilso/PitchDetect/blob/main/js/pitchdetect.js

type NonSilentSamples = {
  first: number;
  last: number;
};

export class Autocorrelator {
  constructor(
    private _audioBuffer: Float32Array,
    private _sampleRate: number,
  ) {}

  autocorrelate(): number {
    if (this._calculateRMS(this._audioBuffer) < 0.01) {
      return -1;
    }

    const { first, last } = this._getNonSilentSamples(this._audioBuffer);

    // Trim to only include non-silent samples
    const trimmedBuffer = this._audioBuffer.slice(first, last);
    const autocorrelation = this._calculateAutocorrelation(trimmedBuffer);
    const bufferSize = autocorrelation.length;

    // find the first minimum in the autocorrelation
    let firstMinIndex = 0;
    while (autocorrelation[firstMinIndex] > autocorrelation[firstMinIndex + 1]) {
      firstMinIndex++;
    }

    // Find the highest peak in the autocorrelation after the first minimum
    let maxValue = -1;
    let maxPosition = -1;
    for (let i = firstMinIndex; i < bufferSize; i++) {
      if (autocorrelation[i] > maxValue) {
        maxValue = autocorrelation[i];
        maxPosition = i;
      }
    }
    let fundamentalPeriod = maxPosition;

    // Interpolate the autocorrelation around the highest peak to estimate the fundamental period
    const prevValue = autocorrelation[fundamentalPeriod - 1];
    const peakValue = autocorrelation[fundamentalPeriod];
    const nextValue = autocorrelation[fundamentalPeriod + 1];
    const a = (prevValue + nextValue - 2 * peakValue) / 2;
    const b = (nextValue - prevValue) / 2;

    if (a) {
      fundamentalPeriod = fundamentalPeriod - b / (2 * a);
    }

    // Return the estimated fundamental frequency
    return this._sampleRate / fundamentalPeriod;
  }

  private _calculateRMS(audioBuffer: Float32Array): number {
    const bufferSize = audioBuffer.length;
    let rms = 0;

    for (let i = 0; i < bufferSize; i++) {
      const sampleValue = audioBuffer[i];
      rms += sampleValue * sampleValue;
    }
    return Math.sqrt(rms / bufferSize);
  }

  private _getNonSilentSamples(audioBuffer: Float32Array): NonSilentSamples {
    const bufferSize = audioBuffer.length;
    const threshold = 0.2;
    let first = 0;
    let last = bufferSize - 1;

    for (let i = 0; i < bufferSize / 2; i++) {
      if (Math.abs(audioBuffer[i]) < threshold) {
        first = i;
        break;
      }
    }

    for (let i = 1; i < bufferSize / 2; i++) {
      if (Math.abs(audioBuffer[bufferSize - i]) < threshold) {
        last = bufferSize - i;
        break;
      }
    }
    return { first, last };
  }

  private _calculateAutocorrelation(audioBuffer: Float32Array): number[] {
    const bufferSize = audioBuffer.length;
    const autocorrelation = new Array(bufferSize).fill(0) as number[];
    for (let i = 0; i < bufferSize; i++) {
      for (let j = 0; j < bufferSize - i; j++) {
        autocorrelation[i] = autocorrelation[i] + audioBuffer[j] * audioBuffer[i + j];
      }
    }

    return autocorrelation;
  }
}

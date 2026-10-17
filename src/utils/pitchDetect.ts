/**
 * Простий autocorrelation pitch detector (YIN-подібний поріг).
 * Повертає Hz або -1 якщо сигнал занадто тихий / неясний.
 */
export function detectPitch(buf: Float32Array, sampleRate: number): number {
  let rms = 0;
  for (let i = 0; i < buf.length; i += 1) {
    rms += buf[i] * buf[i];
  }
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) return -1;

  const SIZE = buf.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let found = false;
  let lastCorrelation = 1;

  for (let offset = 0; offset < MAX_SAMPLES; offset += 1) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i += 1) {
      correlation += Math.abs(buf[i] - buf[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      found = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (found) {
      break;
    }
    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.9 && bestOffset > 0) {
    return sampleRate / bestOffset;
  }
  return -1;
}

import { createFilterNode } from "./DAW2/audioHandlers";

export const WAVEFORM_STYLES = {
  DEFAULT: 'default',
  SOUNDCLOUD_SPLIT: 'sc_split',
  SOUNDTRAP_BARS: 'st_bars',
  GLOW_LINES: 'glow_lines',
  WATERCOLOR: 'watercolor',
  MODERN_BARS: 'modern_bars',
  DUAL_GRADIENT: 'dual_grad',
  NEON_OUTLINE: 'neon_outline',
  WAVY_RIBBON: 'wavy_ribbon',
  FADED_PEAKS: 'faded_peaks',
  GEOMETRIC: 'geometric'
};

export const drawWaveform = (
  canvas,
  audioBuffer,
  pixelsPerSecond,
  track,
  setTracks,
  waveformColor = "#2196F3",
  clipColor = "#FF0000",
  style = WAVEFORM_STYLES.DEFAULT
) => {
  if (!canvas || !audioBuffer) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { duration, numberOfChannels: numChannels } = audioBuffer;
  const totalWidth = Math.ceil(duration * pixelsPerSecond);
  const height = canvas.height;

  canvas.width = totalWidth + track.startTime * pixelsPerSecond;
  canvas.style.width = `${canvas.width}px`;
  ctx.clearRect(0, 0, canvas.width, height);

  const offlineContext = new OfflineAudioContext({
    numberOfChannels: numChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
  });

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  let lastNode = source;
  if (track.filters?.length > 0) {
    track.filters.forEach((filter) => {
      const filterNode = createFilterNode(offlineContext, filter);
      lastNode.connect(filterNode);
      lastNode = filterNode;
    });
  }
  lastNode.connect(offlineContext.destination);
  source.start(0);

  offlineContext.startRendering().then((renderedBuffer) => {
    const { clipTimes, peaks } = analyzeAudioData(renderedBuffer, numChannels);
    
    if (JSON.stringify(track.clipTimes) !== JSON.stringify(clipTimes)) {
      setTracks(prev => prev.map(t => t.id === track.id ? {...t, clipTimes} : t));
    }

    const channelHeight = numChannels === 2 ? height / 2 : height;
    const verticalScale = (channelHeight / 2) / Math.max(...peaks);
    const precomputed = precomputePeaks(renderedBuffer, pixelsPerSecond, numChannels);

    switch(style) {
      case WAVEFORM_STYLES.SOUNDCLOUD_SPLIT:
        drawSoundcloudSplit(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.SOUNDTRAP_BARS:
        drawSoundtrapBars(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.GLOW_LINES:
        drawGlowLines(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.WATERCOLOR:
        drawWatercolor(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.MODERN_BARS:
        drawModernBars(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.DUAL_GRADIENT:
        drawDualGradient(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.NEON_OUTLINE:
        drawNeonOutline(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.WAVY_RIBBON:
        drawWavyRibbon(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.FADED_PEAKS:
        drawFadedPeaks(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      case WAVEFORM_STYLES.GEOMETRIC:
        drawGeometric(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
        break;
      default:
        drawDefaultWaveform(ctx, precomputed, numChannels, totalWidth, height, channelHeight, verticalScale, waveformColor, clipColor, track, pixelsPerSecond);
    }
  }).catch(console.error);
};

function analyzeAudioData(buffer, numChannels) {
  const sampleRate = buffer.sampleRate;
  const clipTimes = new Set();
  const peaks = new Array(numChannels).fill(0);

  for (let channel = 0; channel < numChannels; channel++) {
    const data = buffer.getChannelData(channel);
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const absVal = Math.abs(data[i]);
      if (absVal > peak) peak = absVal;
      if (absVal >= 1.0) clipTimes.add(i / sampleRate);
    }
    peaks[channel] = peak || 0.001;
  }

  return {
    clipTimes: Array.from(clipTimes).sort((a, b) => a - b),
    peaks
  };
}

function precomputePeaks(buffer, pxPerSec, numChannels) {
  const sampleRate = buffer.sampleRate;
  const totalPixels = Math.ceil(buffer.duration * pxPerSec);
  const peaks = Array(numChannels);

  for (let channel = 0; channel < numChannels; channel++) {
    peaks[channel] = new Array(totalPixels);
    const data = buffer.getChannelData(channel);
    
    for (let pixel = 0; pixel < totalPixels; pixel++) {
      const startSample = Math.floor((pixel / pxPerSec) * sampleRate);
      const endSample = Math.ceil(((pixel + 1) / pxPerSec) * sampleRate);
      const slice = data.subarray(startSample, endSample);
      
      let max = -Infinity;
      let min = Infinity;
      let clip = false;
      
      for (let i = 0; i < slice.length; i++) {
        max = Math.max(max, slice[i]);
        min = Math.min(min, slice[i]);
        if (Math.abs(slice[i]) >= 1.0) clip = true;
      }
      
      peaks[channel][pixel] = {
        max: max === -Infinity ? 0 : max,
        min: min === Infinity ? 0 : min,
        clip
      };
    }
  }
  
  return peaks;
}

function hexToRGBA(color, alpha) {
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    return `rgba(${r},${g},${b},${alpha !== undefined ? alpha : a})`;
  }

  const hex = color.replace(/^#/, '');
  const hexParts = hex.match(/\w\w/g) || [];
  let r = 0, g = 0, b = 0, a = 1;
  
  if (hexParts.length >= 3) {
    [r, g, b] = hexParts.slice(0, 3).map(p => parseInt(p, 16));
    if (hexParts.length >= 4) {
      a = parseInt(hexParts[3], 16) / 255;
    }
  } else if (hex.length === 3) {
    [r, g, b] = hex.split('').map(p => parseInt(p + p, 16));
  }
  
  return `rgba(${r},${g},${b},${alpha !== undefined ? alpha : a})`;
}

function drawClipIndicator(ctx, x, yCenter, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x - 2, yCenter - 2, 4, 4);
  ctx.restore();
}

function drawDefaultWaveform(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { max } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - max * verticalScale);
      else ctx.lineTo(xPos, yCenter - max * verticalScale);
    }

    for (let x = totalWidth - 1; x >= 0; x--) {
      const { min } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      ctx.lineTo(xPos, yCenter - min * verticalScale);
    }

    ctx.closePath();
    ctx.fillStyle = hexToRGBA(color, 0.3);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let x = 0; x < totalWidth; x++) {
      if (channelPeaks[x].clip) {
        drawClipIndicator(ctx, x + track.startTime * pxPerSec, yCenter, clipColor);
      }
    }
  });
}

function drawSoundcloudSplit(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  const splitGap = 4;
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    const upperGradient = ctx.createLinearGradient(0, yCenter - splitGap, 0, yCenter - channelHeight);
    upperGradient.addColorStop(0, hexToRGBA(color, 0.8));
    upperGradient.addColorStop(1, color);

    const lowerGradient = ctx.createLinearGradient(0, yCenter + splitGap, 0, yCenter + channelHeight);
    lowerGradient.addColorStop(0, hexToRGBA(color, 0.8));
    lowerGradient.addColorStop(1, color);

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { max } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - max * verticalScale - splitGap);
      else ctx.lineTo(xPos, yCenter - max * verticalScale - splitGap);
    }
    ctx.strokeStyle = upperGradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { min } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - min * verticalScale + splitGap);
      else ctx.lineTo(xPos, yCenter - min * verticalScale + splitGap);
    }
    ctx.strokeStyle = lowerGradient;
    ctx.stroke();

    for (let x = 0; x < totalWidth; x++) {
      if (channelPeaks[x].clip) {
        drawClipIndicator(ctx, x + track.startTime * pxPerSec, yCenter, clipColor);
      }
    }
  });
}

function drawSoundtrapBars(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    for (let x = 0; x < totalWidth; x++) {
      const { max, min, clip } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      const barHeight = (max - min) * verticalScale;
      const yTop = yCenter - max * verticalScale;

      ctx.fillStyle = hexToRGBA(color, 0.6);
      ctx.fillRect(xPos, yTop, 1, barHeight);
      
      if (clip) {
        ctx.fillStyle = clipColor;
        ctx.fillRect(xPos - 1, yCenter - 1, 3, 3);
      }
    }
  });
}

function drawGlowLines(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.lineJoin = 'round';

  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { max } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - max * verticalScale);
      else ctx.lineTo(xPos, yCenter - max * verticalScale);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { min } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - min * verticalScale);
      else ctx.lineTo(xPos, yCenter - min * verticalScale);
    }
    ctx.stroke();

    for (let x = 0; x < totalWidth; x++) {
      if (channelPeaks[x].clip) {
        drawClipIndicator(ctx, x + track.startTime * pxPerSec, yCenter, clipColor);
      }
    }
  });

  ctx.shadowBlur = 0;
}

function drawWatercolor(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  ctx.globalAlpha = 0.6;
  
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    for (let x = 0; x < totalWidth; x++) {
      const { max, min, clip } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      const amp = (max - min) * 0.5;

      ctx.strokeStyle = hexToRGBA(color, 0.3 + amp);
      ctx.lineWidth = 1 + amp * 2;
      
      ctx.beginPath();
      ctx.moveTo(xPos - 1, yCenter - max * verticalScale + Math.random() * 2);
      ctx.lineTo(xPos + 1, yCenter - max * verticalScale - Math.random() * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(xPos - 1, yCenter - min * verticalScale + Math.random() * 2);
      ctx.lineTo(xPos + 1, yCenter - min * verticalScale - Math.random() * 2);
      ctx.stroke();

      if (clip) {
        drawClipIndicator(ctx, xPos, yCenter, clipColor);
      }
    }
  });
  
  ctx.globalAlpha = 1.0;
}

function drawModernBars(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    for (let x = 0; x < totalWidth; x++) {
      const { max, min, clip } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      const barHeight = (max - min) * verticalScale;
      const yTop = yCenter - max * verticalScale;

      const gradient = ctx.createLinearGradient(xPos, yTop, xPos, yTop + barHeight);
      gradient.addColorStop(0, hexToRGBA(color, 0.9));
      gradient.addColorStop(1, hexToRGBA(color, 0.6));

      ctx.fillStyle = gradient;
      ctx.fillRect(xPos, yTop, 2, barHeight);
      
      if (clip) {
        ctx.fillStyle = clipColor;
        ctx.fillRect(xPos, yCenter - 1, 2, 3);
      }
    }
  });
}

function drawDualGradient(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  const parsedColor = hexToRGBA(color);
  const colorValues = parsedColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/).map(Number);
  const [r, g, b, a] = colorValues.slice(1, 5);

  const adjust = (val, amount) => Math.min(255, Math.max(0, val + amount * 2));

  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    const colorLight = `rgba(${adjust(r, 30)},${adjust(g, 30)},${adjust(b, 30)},${a})`;
    const colorDark = `rgba(${adjust(r, -30)},${adjust(g, -30)},${adjust(b, -30)},${a})`;

    const upperGradient = ctx.createLinearGradient(0, yCenter - channelHeight, 0, yCenter);
    upperGradient.addColorStop(0, colorLight);
    upperGradient.addColorStop(1, color);

    const lowerGradient = ctx.createLinearGradient(0, yCenter, 0, yCenter + channelHeight);
    lowerGradient.addColorStop(0, color);
    lowerGradient.addColorStop(1, colorDark);

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { max } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - max * verticalScale);
      else ctx.lineTo(xPos, yCenter - max * verticalScale);
    }
    ctx.strokeStyle = upperGradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { min } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - min * verticalScale);
      else ctx.lineTo(xPos, yCenter - min * verticalScale);
    }
    ctx.strokeStyle = lowerGradient;
    ctx.stroke();

    for (let x = 0; x < totalWidth; x++) {
      if (channelPeaks[x].clip) {
        drawClipIndicator(ctx, x + track.startTime * pxPerSec, yCenter, clipColor);
      }
    }
  });
}

function drawNeonOutline(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  ctx.shadowBlur = 15;
  ctx.shadowColor = color;
  ctx.lineWidth = 2;

  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { max } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - max * verticalScale);
      else ctx.lineTo(xPos, yCenter - max * verticalScale);
    }
    ctx.strokeStyle = color;
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { min } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - min * verticalScale);
      else ctx.lineTo(xPos, yCenter - min * verticalScale);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { max } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      if (x === 0) ctx.moveTo(xPos, yCenter - max * verticalScale);
      else ctx.lineTo(xPos, yCenter - max * verticalScale);
    }
    for (let x = totalWidth - 1; x >= 0; x--) {
      const { min } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      ctx.lineTo(xPos, yCenter - min * verticalScale);
    }
    ctx.closePath();
    ctx.fillStyle = hexToRGBA(color, 0.2);
    ctx.fill();

    for (let x = 0; x < totalWidth; x++) {
      if (channelPeaks[x].clip) {
        drawClipIndicator(ctx, x + track.startTime * pxPerSec, yCenter, clipColor);
      }
    }
  });

  ctx.shadowBlur = 0;
}

function drawWavyRibbon(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    const gradient = ctx.createLinearGradient(0, yCenter - channelHeight, 0, yCenter + channelHeight);
    gradient.addColorStop(0, hexToRGBA(color, 0.8));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, hexToRGBA(color, 0.8));

    ctx.beginPath();
    for (let x = 0; x < totalWidth; x++) {
      const { max } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      const y = yCenter - max * verticalScale;
      
      if (x === 0) ctx.moveTo(xPos, y);
      else {
        const cpX = (xPos + (x - 1 + track.startTime * pxPerSec)) / 2;
        ctx.quadraticCurveTo(cpX, y, xPos, y);
      }
    }
    
    for (let x = totalWidth - 1; x >= 0; x--) {
      const { min } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      const y = yCenter - min * verticalScale;
      
      if (x === totalWidth - 1) ctx.lineTo(xPos, y);
      else {
        const cpX = (xPos + (x + 1 + track.startTime * pxPerSec)) / 2;
        ctx.quadraticCurveTo(cpX, y, xPos, y);
      }
    }
    
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = hexToRGBA(color, 0.8);
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let x = 0; x < totalWidth; x++) {
      if (channelPeaks[x].clip) {
        drawClipIndicator(ctx, x + track.startTime * pxPerSec, yCenter, clipColor);
      }
    }
  });
}

function drawFadedPeaks(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    ctx.strokeStyle = hexToRGBA(color, 0.3);
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, yCenter);
    ctx.lineTo(totalWidth, yCenter);
    ctx.stroke();
    ctx.setLineDash([]);

    let lastMax = 0, lastMin = 0;
    for (let x = 0; x < totalWidth; x++) {
      const { max, min, clip } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      const yTop = yCenter - max * verticalScale;
      const yBottom = yCenter - min * verticalScale;

      if (x > 0) {
        ctx.strokeStyle = hexToRGBA(color, 0.6);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xPos - 1, yCenter - lastMax * verticalScale);
        ctx.lineTo(xPos, yTop);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xPos - 1, yCenter - lastMin * verticalScale);
        ctx.lineTo(xPos, yBottom);
        ctx.stroke();
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(xPos, yTop, 1, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(xPos, yBottom, 1, 0, Math.PI * 2);
      ctx.fill();

      if (clip) {
        drawClipIndicator(ctx, xPos, yCenter, clipColor);
      }

      lastMax = max;
      lastMin = min;
    }
  });
}

function drawGeometric(ctx, peaks, numChannels, totalWidth, height, channelHeight, verticalScale, color, clipColor, track, pxPerSec) {
  peaks.forEach((channelPeaks, channel) => {
    const yCenter = numChannels === 2 ? 
      (channel === 0 ? channelHeight/2 : channelHeight*1.5) : 
      height/2;

    for (let x = 0; x < totalWidth; x++) {
      const { max, min, clip } = channelPeaks[x];
      const xPos = x + track.startTime * pxPerSec;
      const yTop = yCenter - max * verticalScale;
      const yBottom = yCenter - min * verticalScale;

      ctx.fillStyle = hexToRGBA(color, 0.8);
      ctx.beginPath();
      ctx.moveTo(xPos, yTop - 1);
      ctx.lineTo(xPos + 1, yTop);
      ctx.lineTo(xPos, yTop + 1);
      ctx.lineTo(xPos - 1, yTop);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(xPos, yBottom);
      ctx.lineTo(xPos + 1, yBottom + 1);
      ctx.lineTo(xPos - 1, yBottom + 1);
      ctx.closePath();
      ctx.fill();

      if (clip) {
        ctx.fillStyle = clipColor;
        ctx.fillRect(xPos - 1, yCenter - 1, 3, 3);
      }
    }
  });
}




/*import { createFilterNode } from "./DAW2/audioHandlers";

export const drawWaveform = (
  canvas,
  audioBuffer,
  pixelsPerSecond,
  track,
  setTracks,
  waveformColor = "#2196F3",
  clipColor = "#FF0000"
) => {
  if (!canvas || !audioBuffer) return;

  const ctx = canvas.getContext("2d");
  const { duration, numberOfChannels: numChannels } = audioBuffer;
  const totalWidth = duration * pixelsPerSecond;
  const height = canvas.height;

  // Configurar canvas
  canvas.width = totalWidth + track.startTime * pixelsPerSecond;
  canvas.style.width = `${canvas.width}px`;
  ctx.clearRect(0, 0, canvas.width, height);

  // Crear contexto offline para procesar con filtros
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: numChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
  });

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  let lastNode = source;
  if (track.filters?.length > 0) {
    track.filters.forEach((filter) => {
      const filterNode = createFilterNode(offlineContext, filter);
      lastNode.connect(filterNode);
      lastNode = filterNode;
    });
  }
  lastNode.connect(offlineContext.destination);
  source.start(0);

  offlineContext
    .startRendering()
    .then((renderedBuffer) => {
      const sampleRate = renderedBuffer.sampleRate;
      const clipTimesSet = new Set();
      for (let channel = 0; channel < numChannels; channel++) {
        const data = renderedBuffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          if (Math.abs(data[i]) >= 1.0) {
            clipTimesSet.add(i / sampleRate);
          }
        }
      }
      const clipTimes = Array.from(clipTimesSet).sort((a, b) => a - b);

      if (JSON.stringify(track.clipTimes) !== JSON.stringify(clipTimes)) {
        setTracks((prevTracks) =>
          prevTracks.map((t) =>
            t.id === track.id ? { ...t, clipTimes } : t
          )
        );
      }

      // Calcular picos de forma segura (sin desbordar la pila)
      const peaks = [];
      for (let channel = 0; channel < numChannels; channel++) {
        const data = renderedBuffer.getChannelData(channel);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const absVal = Math.abs(data[i]);
          if (absVal > peak) peak = absVal;
        }
        peaks[channel] = peak || 1; // Evitar división por cero
      }

      const channelHeight = numChannels === 2 ? height / 2 : height;
      const verticalScale = (channelHeight * 0.6) / Math.max(...peaks);
      const displayColor = waveformColor;

      // Dibujar forma de onda
      for (let channel = 0; channel < numChannels; channel++) {
        const data = renderedBuffer.getChannelData(channel);
        const yCenter =
          numChannels === 2
            ? channel === 0
              ? channelHeight / 2
              : channelHeight * 1.5
            : height / 2;

        ctx.beginPath();
        ctx.strokeStyle = displayColor;
        ctx.lineWidth = 1;

        for (let x = 0; x < totalWidth; x++) {
          const startTime = x / pixelsPerSecond;
          const endTime = (x + 1) / pixelsPerSecond;
          const startSample = Math.floor(startTime * sampleRate);
          const endSample = Math.ceil(endTime * sampleRate);

          let max = -Infinity;
          let min = Infinity;
          let hasClip = false;
          for (let i = startSample; i < endSample && i < data.length; i++) {
            max = Math.max(max, data[i]);
            min = Math.min(min, data[i]);
            if (Math.abs(data[i]) >= 1.0) hasClip = true;
          }

          const yMax = yCenter - max * verticalScale;
          const yMin = yCenter - min * verticalScale;
          const xPos = x + track.startTime * pixelsPerSecond;

          if (hasClip) {
            ctx.stroke(); // Cierra el trazo actual
            ctx.beginPath();
            ctx.strokeStyle = clipColor;
            ctx.lineWidth = 1.5;
            ctx.moveTo(xPos, yMax);
            ctx.lineTo(xPos, yMin);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = displayColor;
            ctx.lineWidth = 1;
          } else {
            ctx.moveTo(xPos, yMax);
            ctx.lineTo(xPos, yMin);
          }
        }
        ctx.stroke();
      }
    })
    .catch((error) => {
      console.error("Error al renderizar el audio:", error);
    });
};*/














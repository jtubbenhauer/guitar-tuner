import { useEffect, useState } from 'react';
import { Autocorrelator } from '../utils/autocorrelation.ts';

export enum AudioContextState {
  Closed = 'closed',
  Suspended = 'suspended',
  Running = 'running',
}

export function useAudio() {
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode>();
  const [mediaStream, setMediaStream] = useState<MediaStream>();

  useEffect(() => {
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();

    analyser.minDecibels = -100;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    analyser.fftSize = 2048;

    setAudioContext(audioCtx);
    setAnalyserNode(analyser);

    navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream) => {
      setMediaStream(mediaStream);
      if (!audioCtx) {
        return;
      }
      const sourceNode = audioCtx.createMediaStreamSource(mediaStream);
      sourceNode.connect(analyser);
    });
  }, []);

  useEffect(() => {
    if (!audioContext || !analyserNode || !mediaStream) {
      return;
    }

    const sourceNode = audioContext.createMediaStreamSource(mediaStream);
    sourceNode.connect(analyserNode);

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const updatePitch = () => {
      analyserNode.getFloatTimeDomainData(dataArray);
      const autocorrelator = new Autocorrelator(dataArray, audioContext.sampleRate);
      const frequency = autocorrelator.autocorrelate();
      console.log(frequency);
    };

    const updateIntervalId = setInterval(updatePitch, 200);

    return () => {
      clearInterval(updateIntervalId);
      sourceNode.disconnect();
    };
  }, [audioContext, analyserNode, mediaStream]);

  function getAudioContextState(): AudioContextState | undefined {
    if (!audioContext?.state) {
      return;
    }
    switch (audioContext.state) {
      case 'closed':
        return AudioContextState.Closed;
      case 'running':
        return AudioContextState.Running;
      case 'suspended':
        return AudioContextState.Suspended;
    }
  }

  return { audioContext, getAudioContextState };
}

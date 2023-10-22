import Header from './components/header.tsx';
import Page from './components/page.tsx';
import { ReactElement } from 'react';
import { AudioContextState, useAudio } from './lib/hooks/audio.tsx';

export default function App(): ReactElement {
  const { audioContext, getAudioContextState } = useAudio();

  const resumeAudioContext = async () => {
    if (!audioContext) {
      return;
    }
    if (getAudioContextState() === AudioContextState.Suspended) {
      await audioContext.resume();
    }
  };

  return (
    <div className='flex h-full flex-col items-center bg-slate-900 p-4'>
      <Header />
      <Page />
      <button onClick={resumeAudioContext}>Resume</button>
    </div>
  );
}

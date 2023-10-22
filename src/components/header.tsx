import { BsGithub } from 'react-icons/bs';

export default function Header() {
  return (
    <div className='flex w-full items-center justify-between text-slate-100'>
      <span className='text-xl font-bold'>TUNER</span>
      <a
        className='cursor-pointer text-2xl text-slate-100 transition-all hover:text-slate-300'
        href='https://github.com/jtubbenhauer'
        target='_blank'
      >
        <BsGithub />
      </a>
    </div>
  );
}

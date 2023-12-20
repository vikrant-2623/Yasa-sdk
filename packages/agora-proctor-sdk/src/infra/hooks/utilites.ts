import { useRef, useEffect } from 'react';

export const useInterval = (fun: CallableFunction, delay: number, start: boolean) => {
  const myRef = useRef<any>(null);
  useEffect(() => {
    myRef.current = fun;
  }, [fun]);
  useEffect(() => {
    const timer = setInterval(() => {
      myRef.current(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [start, delay]);
};

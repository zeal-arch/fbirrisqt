import { useEffect, useState } from 'react';
import { animate } from 'motion/react';

/* A number that counts to its new value instead of jumping. */
export default function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const c = animate(shown, value, { duration: 0.9, ease: 'easeOut', onUpdate: v => setShown(Math.round(v)) });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{format(shown)}</>;
}

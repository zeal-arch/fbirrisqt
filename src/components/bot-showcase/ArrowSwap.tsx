import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/* The arrow inside a button: on hover it slides out to the top right while a second one slides in from the
   bottom left. Put it inside an element with the `group` class. */
export default function ArrowSwap({ className }: { className?: string }) {
  const arrow = 'absolute h-full w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';
  return (
    <span className={cn('relative inline-block overflow-hidden', className)} aria-hidden="true">
      <ArrowUpRight className={cn(arrow, 'group-hover:-translate-y-full group-hover:translate-x-full')} />
      <ArrowUpRight className={cn(arrow, '-translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0')} />
    </span>
  );
}

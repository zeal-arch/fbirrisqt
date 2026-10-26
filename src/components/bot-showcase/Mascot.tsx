import { Component, Suspense, lazy, type ReactNode } from 'react';
import Briq from './Briq';

/* Briq on the page: the 3D model, loaded separately so it doesn't slow the first paint. The flat drawing shows
   while it loads, and stays if the browser can't do 3D (no WebGL). */

const Briq3D = lazy(() => import('./Briq3D'));

class Fallback extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function Mascot({ size = 160, className }: { size?: number; className?: string }) {
  const flat = (
    <div className={className} style={{ width: size, height: size * 1.2 }}>
      <Briq size={size * 0.85} className="mx-auto" />
    </div>
  );
  return (
    <Fallback fallback={flat}>
      <Suspense fallback={flat}>
        <Briq3D size={size} className={className} />
      </Suspense>
    </Fallback>
  );
}

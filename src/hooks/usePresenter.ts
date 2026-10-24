import { useCallback, useEffect, useRef, useState } from 'react';

/* Plays a list of scripted beats, one phase at a time.
   Each beat goes: typing → message → checks (one by one) → decided → replied → done.
   Autoplays while `active` (e.g. on screen); Step and Restart are for presenting in a meeting. */

export type Phase = 'typing' | 'message' | 'checks' | 'decided' | 'replied' | 'done';
const ORDER: Phase[] = ['typing', 'message', 'checks', 'decided', 'replied', 'done'];

interface BeatShape {
  hasMessage: boolean;
  checks: number;
  hasReply: boolean;
}

interface Position { index: number; phase: Phase; check: number }

const DELAY: Record<Phase, number> = {
  typing: 750,
  message: 800,
  checks: 420,
  decided: 1150,
  replied: 1500,
  done: 400,
};
const LOOP_PAUSE = 6000;

function next(pos: Position, beats: BeatShape[]): Position | null {
  const b = beats[pos.index];
  switch (pos.phase) {
    case 'typing': return { ...pos, phase: 'message' };
    case 'message': return b.checks > 0 ? { ...pos, phase: 'checks', check: 1 } : { ...pos, phase: 'decided' };
    case 'checks': return pos.check < b.checks ? { ...pos, check: pos.check + 1 } : { ...pos, phase: 'decided' };
    case 'decided': return b.hasReply ? { ...pos, phase: 'replied' } : { ...pos, phase: 'done' };
    case 'replied': return { ...pos, phase: 'done' };
    case 'done': {
      if (pos.index + 1 >= beats.length) return null;
      const nb = beats[pos.index + 1];
      return { index: pos.index + 1, phase: nb.hasMessage ? 'typing' : 'decided', check: 0 };
    }
  }
}

const doneAt = (index: number, beats: BeatShape[]): Position => ({ index, phase: 'done', check: beats[index].checks });
const startAt = (beats: BeatShape[]): Position => ({ index: 0, phase: beats[0].hasMessage ? 'typing' : 'decided', check: 0 });

export function usePresenter(beats: BeatShape[], { active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const [pos, setPos] = useState<Position>(() => (reducedMotion ? doneAt(beats.length - 1, beats) : startAt(beats)));
  const [playing, setPlaying] = useState(!reducedMotion);
  const finished = pos.index === beats.length - 1 && pos.phase === 'done';
  const beatsRef = useRef(beats);
  beatsRef.current = beats;

  useEffect(() => {
    if (!playing || !active) return;
    const wait = finished ? LOOP_PAUSE : DELAY[pos.phase];
    const t = window.setTimeout(() => {
      setPos(p => next(p, beatsRef.current) ?? startAt(beatsRef.current));
    }, wait);
    return () => window.clearTimeout(t);
  }, [pos, playing, active, finished]);

  const toggle = useCallback(() => {
    if (finished && !playing) setPos(startAt(beatsRef.current));
    setPlaying(p => !p);
  }, [finished, playing]);

  /* Step finishes the current beat, or shows the whole next beat. */
  const step = useCallback(() => {
    setPlaying(false);
    setPos(p => {
      const b = beatsRef.current;
      if (p.phase !== 'done') return doneAt(p.index, b);
      if (p.index + 1 >= b.length) return startAt(b);
      return doneAt(p.index + 1, b);
    });
  }, []);

  const restart = useCallback(() => {
    setPos(startAt(beatsRef.current));
    setPlaying(true);
  }, []);

  /* Has beat i reached phase `phase` yet? */
  const reached = useCallback(
    (i: number, phase: Phase) => i < pos.index || (i === pos.index && ORDER.indexOf(pos.phase) >= ORDER.indexOf(phase)),
    [pos],
  );

  /* How many checks of beat i are visible. */
  const checksShown = useCallback(
    (i: number) => {
      if (i < pos.index) return beatsRef.current[i].checks;
      if (i > pos.index) return 0;
      if (pos.phase === 'typing' || pos.phase === 'message') return 0;
      if (pos.phase === 'checks') return pos.check;
      return beatsRef.current[i].checks;
    },
    [pos],
  );

  return { index: pos.index, phase: pos.phase, playing, finished, toggle, step, restart, reached, checksShown };
}

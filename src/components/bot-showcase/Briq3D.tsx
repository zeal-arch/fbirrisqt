import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';

/* Briq in 3D: a soft clay terracotta brick in a site helmet, waving with one hand and holding a bill in the other.
   It bobs, blinks now and then, and turns a little towards the pointer. Everything is built from simple shapes
   (no model files, no textures), so it loads with the page and stays light. */

const BRICK = '#D9572B';
const BRICK_DARK = '#B44520';
const MORTAR = '#E88A63';
const HELMET = '#FFF1D6';
const INK = '#1f1715';

function Character() {
  const root = useRef<Group>(null);
  const wave = useRef<Group>(null);
  const eyes = useRef<Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.getElapsedTime();
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.9) * 0.05;
      /* turn a little towards the pointer, smoothly */
      root.current.rotation.y += (pointer.x * 0.45 - root.current.rotation.y) * Math.min(1, delta * 4);
      root.current.rotation.x += (-pointer.y * 0.12 - root.current.rotation.x) * Math.min(1, delta * 4);
    }
    /* wave for about 1.8 s every 4 s */
    if (wave.current) {
      const p = t % 4;
      wave.current.rotation.z = p < 1.8 ? 0.35 + Math.sin((p / 1.8) * Math.PI * 4) * 0.35 : 0.35;
    }
    /* blink once every 4.5 s */
    if (eyes.current) {
      const b = t % 4.5;
      eyes.current.scale.y = b > 4.3 && b < 4.42 ? 0.12 : 1;
    }
  });

  return (
    <group ref={root}>
      {/* body */}
      <RoundedBox args={[1.6, 2, 1]} radius={0.24} smoothness={6} castShadow>
        <meshStandardMaterial color={BRICK} roughness={0.62} />
      </RoundedBox>

      {/* mortar lines on the lower half, two staggered courses */}
      {[
        { p: [0, -0.32, 0.5], s: [1.36, 0.035, 0.02] },
        { p: [0, -0.68, 0.5], s: [1.36, 0.035, 0.02] },
        { p: [0, -0.5, 0.5], s: [0.035, 0.36, 0.02] },
        { p: [-0.38, -0.84, 0.5], s: [0.035, 0.3, 0.02] },
        { p: [0.38, -0.84, 0.5], s: [0.035, 0.3, 0.02] },
      ].map((m, i) => (
        <mesh key={i} position={m.p as [number, number, number]}>
          <boxGeometry args={m.s as [number, number, number]} />
          <meshStandardMaterial color={MORTAR} roughness={0.8} />
        </mesh>
      ))}

      {/* eyes, with pupils and highlights */}
      <group ref={eyes} position={[0, 0.38, 0.47]}>
        {[-0.3, 0.3].map(x => (
          <group key={x} position={[x, 0, 0]}>
            <mesh scale={[1, 1.15, 0.55]}>
              <sphereGeometry args={[0.17, 32, 32]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
            <mesh position={[0.02, -0.02, 0.08]}>
              <sphereGeometry args={[0.085, 32, 32]} />
              <meshStandardMaterial color={INK} roughness={0.2} />
            </mesh>
            <mesh position={[0.05, 0.03, 0.15]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* cheeks and smile */}
      {[-0.52, 0.52].map(x => (
        <mesh key={x} position={[x, 0.08, 0.505]}>
          <circleGeometry args={[0.1, 32]} />
          <meshBasicMaterial color="#ff9b88" transparent opacity={0.55} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, 0.5]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.13, 0.03, 16, 32, Math.PI]} />
        <meshStandardMaterial color={INK} roughness={0.4} />
      </mesh>

      {/* site helmet, slightly tilted */}
      <group position={[0.05, 1.02, 0]} rotation={[0, 0, -0.12]}>
        <mesh scale={[1, 0.72, 0.85]}>
          <sphereGeometry args={[0.72, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={HELMET} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.01, 0.05]}>
          <cylinderGeometry args={[0.86, 0.86, 0.06, 48]} />
          <meshStandardMaterial color="#F6E3BE" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.38, 0]} scale={[1, 1, 0.9]}>
          <boxGeometry args={[0.12, 0.2, 1.1]} />
          <meshStandardMaterial color="#F1DCB4" roughness={0.4} />
        </mesh>
      </group>

      {/* waving arm, pivoting at the shoulder */}
      <group ref={wave} position={[-0.8, 0.05, 0]}>
        <mesh position={[-0.18, 0.32, 0]} rotation={[0, 0, 0.35]}>
          <capsuleGeometry args={[0.13, 0.5, 8, 16]} />
          <meshStandardMaterial color={BRICK} roughness={0.62} />
        </mesh>
      </group>

      {/* other arm, holding a bill */}
      <mesh position={[0.92, -0.25, 0.15]} rotation={[0.2, 0, -0.5]}>
        <capsuleGeometry args={[0.13, 0.45, 8, 16]} />
        <meshStandardMaterial color={BRICK} roughness={0.62} />
      </mesh>
      <group position={[1.12, -0.55, 0.42]} rotation={[0, -0.3, 0.12]}>
        <mesh>
          <boxGeometry args={[0.5, 0.66, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {[0.2, 0.1, 0, -0.1].map(y => (
          <mesh key={y} position={[-0.03, y, 0.012]}>
            <boxGeometry args={[0.32, 0.025, 0.005]} />
            <meshBasicMaterial color="#c9bfb2" />
          </mesh>
        ))}
        <mesh position={[0.06, -0.22, 0.012]}>
          <boxGeometry args={[0.22, 0.035, 0.005]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>

      {/* legs */}
      {[-0.36, 0.36].map(x => (
        <mesh key={x} position={[x, -1.22, 0]}>
          <capsuleGeometry args={[0.16, 0.3, 8, 16]} />
          <meshStandardMaterial color={BRICK_DARK} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

export default function Briq3D({ size = 180, className }: { size?: number; className?: string }) {
  return (
    <div className={className} style={{ width: size, height: size * 1.2 }} role="img" aria-label="Briq, the Site Bot mascot: a brick in a site helmet, waving and holding a bill">
      <Canvas camera={{ position: [0, 0.3, 6.2], fov: 34 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, 2, -2]} intensity={0.5} color="#bcd0ff" />
        <Character />
        <ContactShadows position={[0, -1.62, 0]} opacity={0.32} scale={5} blur={2.6} far={2} />
      </Canvas>
    </div>
  );
}


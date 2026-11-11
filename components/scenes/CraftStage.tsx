"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Piece } from "./Craft";

const GAP = 9; // distance between pieces along the camera's path

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The photograph is real; the shader only adds a travelling lamp. Bright metal
// in the frame answers the light, dark velvet does not, and the edges dissolve
// into the room instead of ending in a hard rectangle.
const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uLight;
  uniform float uOpacity;
  uniform float uFocus;
  varying vec2 vUv;

  void main() {
    // cheap depth of field: widen the sample when the piece is out of focus
    vec2 px = vec2(0.0035) * (1.0 - uFocus);
    vec3 c = texture2D(uMap, vUv).rgb * 0.4;
    c += texture2D(uMap, vUv + vec2(px.x, 0.0)).rgb * 0.15;
    c += texture2D(uMap, vUv - vec2(px.x, 0.0)).rgb * 0.15;
    c += texture2D(uMap, vUv + vec2(0.0, px.y)).rgb * 0.15;
    c += texture2D(uMap, vUv - vec2(0.0, px.y)).rgb * 0.15;

    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    float d = distance(vUv, uLight);
    float lamp = smoothstep(0.55, 0.0, d);
    vec3 warm = vec3(1.0, 0.86, 0.6);
    c *= 0.62 + 0.5 * lamp;
    c += warm * pow(lum, 2.2) * lamp * 0.85;

    vec2 e = smoothstep(0.0, 0.16, vUv) * smoothstep(0.0, 0.16, 1.0 - vUv);
    float edge = e.x * e.y;

    gl_FragColor = vec4(c, edge * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function PiecePlane({ piece, index, progress }: { piece: Piece; index: number; progress: React.RefObject<number> }) {
  const map = useTexture(piece.src);
  const mesh = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();
  const light = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    return {
      uMap: { value: map },
      uLight: { value: new THREE.Vector2(0.5, 0.5) },
      uOpacity: { value: 0 },
      uFocus: { value: 0 },
    };
  }, [map]);

  const h = 3.5;
  const w = h * piece.aspect;
  const x = (index % 2 === 0 ? 1 : -1) * 1.45;

  useFrame((state, dt) => {
    const cam = state.camera.position.z;
    const rest = -index * GAP + 6.2; // camera z at which this piece is in focus
    const off = Math.abs(cam - rest);
    const focus = THREE.MathUtils.clamp(1 - off / 3.2, 0, 1);
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uFocus.value = focus;
    u.uOpacity.value = THREE.MathUtils.clamp(1.25 - off / 5.5, 0, 1);

    // the lamp follows the pointer, and drifts on its own when the pointer rests
    const t = state.clock.elapsedTime;
    const tx = 0.5 + pointer.x * 0.35 + Math.sin(t * 0.35 + index) * 0.12;
    const ty = 0.55 + pointer.y * 0.3 + Math.cos(t * 0.27 + index) * 0.08;
    light.current.lerp(new THREE.Vector2(tx, ty), Math.min(1, dt * 3));
    u.uLight.value.copy(light.current);

    if (mesh.current) {
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, -x * 0.07 + pointer.x * 0.05, 0.06);
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, -pointer.y * 0.035, 0.06);
    }
    if (ring.current) {
      ring.current.rotation.z += dt * 0.07;
      ring.current.rotation.x = 0.35 + Math.sin(t * 0.2 + index) * 0.12;
      ring.current.rotation.y = (progress.current ?? 0) * Math.PI * 1.2 + index;
    }
  });

  return (
    <group position={[x, 0, -index * GAP]}>
      <mesh ref={mesh}>
        <planeGeometry args={[w, h]} />
        <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
      </mesh>
      {/* a jeweller's loupe ring in polished gold, the one invented object in the room */}
      <mesh ref={ring} position={[0, 0, 0.4]}>
        <torusGeometry args={[Math.min(w, h) * 0.78, 0.014, 24, 220]} />
        <meshStandardMaterial color="#c9a45c" metalness={1} roughness={0.2} envMapIntensity={1.6} />
      </mesh>
    </group>
  );
}

function Rig({ progress, count }: { progress: React.RefObject<number>; count: number }) {
  useFrame((state) => {
    const p = progress.current ?? 0;
    const travel = (count - 1) * GAP;
    // hold on each piece, glide between them
    const seg = p * (count - 1);
    const i = Math.min(count - 2, Math.floor(seg));
    const f = seg - i;
    const eased = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    const z = 6.2 - Math.min(travel, (i + eased) * GAP);
    const cam = state.camera;
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, z, 0.12);
    const side = Math.sin(seg * Math.PI) * 0.55;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, side + state.pointer.x * 0.12, 0.06);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, state.pointer.y * 0.08, 0.06);
    cam.lookAt(cam.position.x * 0.4, 0, cam.position.z - 6);
  });
  return null;
}

export default function CraftStage({ pieces, progress, running }: { pieces: Piece[]; progress: React.RefObject<number>; running: boolean }) {
  return (
    <Canvas
      frameloop={running ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ fov: 34, position: [0, 0, 6.2], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <fog attach="fog" args={["#0b0506", 5, 17]} />
      <Suspense fallback={null}>
        {pieces.map((p, i) => (
          <PiecePlane key={p.src} piece={p} index={i} progress={progress} />
        ))}
        {/* studio lighting built in code: nothing fetched from the network */}
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={5} position={[0, 4, 2]} scale={[8, 1.2, 1]} color="#fff1d6" />
          <Lightformer form="rect" intensity={2.5} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 0.6, 1]} color="#e3c78d" />
          <Lightformer form="rect" intensity={1.5} position={[5, -1, 3]} rotation-y={-Math.PI / 2} scale={[6, 0.5, 1]} color="#7a1a2c" />
          <Lightformer form="ring" intensity={3} position={[0, -3, 4]} scale={2} color="#ffffff" />
        </Environment>
      </Suspense>
      <Rig progress={progress} count={pieces.length} />
    </Canvas>
  );
}

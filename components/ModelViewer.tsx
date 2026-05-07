"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ModelViewer({ modelPath = "/models/vigil_event.glb" }: { modelPath?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // subtle fog for depth
    scene.fog = new THREE.FogExp2(0x000000, 0.035);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.01,
      1000
    );
    camera.position.set(0, 1.2, 4.5);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ── Lighting — dramatic / cinematic ───────────────────────────────────
    // Key light — cool blue-white from upper left
    const keyLight = new THREE.DirectionalLight(0xb0d4ff, 6);
    keyLight.position.set(-3, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Rim light — white from behind
    const rimLight = new THREE.DirectionalLight(0xffffff, 3.0);
    rimLight.position.set(4, 2, -5);
    scene.add(rimLight);

    // Fill light — soft white from below
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    // Ambient — barely visible
    const ambient = new THREE.AmbientLight(0x222222, 0.4);
    scene.add(ambient);

    // Ground bounce — subtle warm
    const groundBounce = new THREE.HemisphereLight(0x000000, 0x331100, 0.3);
    scene.add(groundBounce);

    // ── OrbitControls ──────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.5;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enablePan = false;

    // pause auto-rotate while user is dragging
    const onStart = () => { controls.autoRotate = false; };
    const onEnd   = () => { controls.autoRotate = true; };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end",   onEnd);

    // ── Grid / floor accent ────────────────────────────────────────────────
    const gridHelper = new THREE.GridHelper(20, 40, 0x111111, 0x0a0a0a);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // ── Load GLB ───────────────────────────────────────────────────────────
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(window.location.origin + "/draco/");
    dracoLoader.preload();
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    let animMixer: THREE.AnimationMixer | null = null;

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        // center & scale to fit view
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.4 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));

        // shadows & material tweaks
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];
              mat.forEach((m) => {
                if (m instanceof THREE.MeshStandardMaterial) {
                  m.envMapIntensity = 0.6;
                }
              });
            }
          }
        });

        scene.add(model);

        // play built-in animations if any
        if (gltf.animations.length > 0) {
          animMixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            animMixer!.clipAction(clip).play();
          });
        }

        setLoading(false);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          setProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("GLB load error:", msg);
        setError(msg);
        setLoading(false);
      }
    );

    // ── Render loop ────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      animMixer?.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end",   onEnd);
      controls.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return (
    <div className="relative w-full h-full">
      {/* Three.js canvas mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <div className="mb-6 text-[10px] tracking-[0.5em] text-white/30 font-mono uppercase">
            Loading Model
          </div>
          {/* Progress bar */}
          <div className="w-48 h-px bg-white/10 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-white transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 text-[9px] tracking-[0.3em] text-white/20 font-mono">
            {progress}%
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <p className="text-white/40 text-sm font-mono tracking-widest">{error}</p>
        </div>
      )}

      {/* HUD hints */}
      {!loading && !error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-8 pointer-events-none">
          {[
            { icon: "⟳", label: "DRAG TO ROTATE" },
            { icon: "⊕", label: "SCROLL TO ZOOM" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 opacity-30">
              <span className="text-white text-base">{icon}</span>
              <span className="text-white text-[8px] tracking-[0.3em] font-mono">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

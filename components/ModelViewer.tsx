"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

THREE.Cache.enabled = true;

export interface PartInfo {
  name: string;
  tag?: string;
  description: string;
}

interface ModelViewerProps {
  modelPath?: string;
  cameraZ?: number;
  rotationY?: number;
  /** mesh name → part info. 전달 시 클릭 선택 기능 활성화 */
  parts?: Record<string, PartInfo>;
}

export default function ModelViewer({
  modelPath = "/models/vigil_compressed.glb",
  cameraZ = 4.5,
  rotationY = 0,
  parts,
}: ModelViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const partsRef   = useRef(parts);   // 클릭 핸들러 내에서 최신 parts 참조
  const [loading, setLoading]         = useState(true);
  const [progress, setProgress]       = useState(0);
  const [error,   setError]           = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => { partsRef.current = parts; }, [parts]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.035);

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.01, 1000);
    camera.position.set(0, 1.2, cameraZ);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ── Lighting ───────────────────────────────────────────────────────────
    const keyLight = new THREE.DirectionalLight(0xb0d4ff, 6);
    keyLight.position.set(-3, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 3.0);
    rimLight.position.set(4, 2, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0x222222, 0.4));
    scene.add(new THREE.HemisphereLight(0x000000, 0x331100, 0.3));

    // ── OrbitControls ──────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.06;
    controls.minDistance    = 1.5;
    controls.maxDistance    = 12;
    controls.maxPolarAngle  = Math.PI * 0.85;
    controls.autoRotate     = true;
    controls.autoRotateSpeed = 0.6;
    controls.enablePan      = false;

    const onStart = () => { controls.autoRotate = false; };
    const onEnd   = () => { controls.autoRotate = true;  };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end",   onEnd);

    // ── Grid ──────────────────────────────────────────────────────────────
    const gridHelper = new THREE.GridHelper(20, 40, 0x111111, 0x0a0a0a);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // ── Part selection ─────────────────────────────────────────────────────
    const raycaster    = new THREE.Raycaster();
    const mouse        = new THREE.Vector2();
    const meshToKey    = new Map<THREE.Mesh, string>();
    const origEmissive = new Map<THREE.Mesh, { color: THREE.Color; intensity: number }>();
    let selectedMesh: THREE.Mesh | null = null;
    let pointerDownX = 0, pointerDownY = 0, hasDragged = false;

    const allSelectableMeshes = () => Array.from(meshToKey.keys());

    const highlight = (mesh: THREE.Mesh) => {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach(m => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.emissive.set(0x2266ee);
          m.emissiveIntensity = 0.4;
        }
      });
    };

    const restore = (mesh: THREE.Mesh) => {
      const orig = origEmissive.get(mesh);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach(m => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.emissive.copy(orig?.color ?? new THREE.Color(0));
          m.emissiveIntensity = orig?.intensity ?? 0;
        }
      });
    };

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

        // center & uniform scale
        const box = new THREE.Box3().setFromObject(model);
        const size   = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale  = 2.4 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.rotation.y = rotationY;

        model.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          mesh.castShadow = mesh.receiveShadow = true;

          // mesh 이름 → 부모 노드 이름 순으로 key 결정
          const key = mesh.name || mesh.parent?.name || `mesh_${meshToKey.size}`;
          meshToKey.set(mesh, key);

          // 원본 emissive 저장
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const first = mats[0];
          if (first instanceof THREE.MeshStandardMaterial) {
            origEmissive.set(mesh, { color: first.emissive.clone(), intensity: first.emissiveIntensity });
          }
          mats.forEach(m => {
            if (m instanceof THREE.MeshStandardMaterial) m.envMapIntensity = 0.6;
          });
        });

        scene.add(model);

        if (gltf.animations.length > 0) {
          animMixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(clip => animMixer!.clipAction(clip).play());
        }

        setLoading(false);
      },
      (xhr) => {
        if (xhr.lengthComputable) setProgress(Math.round((xhr.loaded / xhr.total) * 100));
      },
      (err) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("GLB load error:", msg);
        setError(msg);
        setLoading(false);
      }
    );

    // ── Pointer handlers: drag vs click 구별 ──────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      hasDragged = false;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownX, dy = e.clientY - pointerDownY;
      if (Math.sqrt(dx * dx + dy * dy) > 5) hasDragged = true;

      if (!partsRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(allSelectableMeshes()).length > 0;
      renderer.domElement.style.cursor = hit ? "pointer" : "";
    };

    const onPointerUp = (e: PointerEvent) => {
      if (hasDragged) return;               // 드래그면 선택 무시
      if (!partsRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allSelectableMeshes());

      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Mesh;
        if (selectedMesh === hit) {
          // 같은 파트 재클릭 → 선택 해제
          restore(hit);
          selectedMesh = null;
          setSelectedKey(null);
        } else {
          if (selectedMesh) restore(selectedMesh);
          highlight(hit);
          selectedMesh = hit;
          setSelectedKey(meshToKey.get(hit) ?? null);
        }
      } else {
        // 빈 곳 클릭 → 선택 해제
        if (selectedMesh) { restore(selectedMesh); selectedMesh = null; }
        setSelectedKey(null);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup",   onPointerUp);

    // ── Render loop ────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      animMixer?.update(clock.getDelta());
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup",   onPointerUp);
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end",   onEnd);
      controls.dispose();
      dracoLoader.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [modelPath, cameraZ, rotationY]);

  const partInfo = selectedKey ? parts?.[selectedKey] : null;

  return (
    <div className="relative w-full h-full">
      {/* Three.js canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* ── 파트 정보 패널 ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {partInfo && (
          <motion.div
            key={selectedKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: 10  }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-20 left-6 max-w-[260px] pointer-events-none"
            style={{
              background: "rgba(0,0,0,0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "14px 18px",
            }}
          >
            {partInfo.tag && (
              <p className="text-white/40 text-[8px] tracking-[0.4em] font-mono uppercase mb-2">
                {partInfo.tag}
              </p>
            )}
            <div className="w-5 h-px bg-white/25 mb-3" />
            <h3 className="text-white text-[13px] font-medium tracking-widest uppercase mb-2 leading-tight">
              {partInfo.name}
            </h3>
            <p className="text-white/45 text-[10px] leading-relaxed font-mono">
              {partInfo.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 로딩 오버레이 ────────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <div className="mb-6 text-[10px] tracking-[0.5em] text-white/30 font-mono uppercase">
            Loading Model
          </div>
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

      {/* ── 에러 오버레이 ────────────────────────────────────────────────── */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <p className="text-white/40 text-sm font-mono tracking-widest">{error}</p>
        </div>
      )}

      {/* ── HUD 힌트 ─────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 pointer-events-none">
          {[
            { icon: "⟳", label: "DRAG TO ROTATE" },
            { icon: "⊕", label: "SCROLL TO ZOOM" },
            ...(parts ? [{ icon: "◎", label: "CLICK TO INSPECT" }] : []),
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 opacity-25">
              <span className="text-white text-sm">{icon}</span>
              <span className="text-white text-[7px] tracking-[0.3em] font-mono">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

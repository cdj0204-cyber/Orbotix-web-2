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
  parts?: Record<string, PartInfo>;
}

export default function ModelViewer({
  modelPath = "/models/vigil_compressed.glb",
  cameraZ = 4.5,
  rotationY = 0,
  parts,
}: ModelViewerProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const partsRef   = useRef(parts);
  useEffect(() => { partsRef.current = parts; }, [parts]);

  const [loading,      setLoading]      = useState(true);
  const [progress,     setProgress]     = useState(0);
  const [error,        setError]        = useState<string | null>(null);
  const [selectedKey,  setSelectedKey]  = useState<string | null>(null);
  const [hotspotKeys,  setHotspotKeys]  = useState<string[]>([]);

  // 3D 월드 좌표 (RAF 루프에서 프로젝션)
  const hotspot3DPos  = useRef<Map<string, THREE.Vector3>>(new Map());
  // 실제 DOM 요소 (RAF 루프에서 style.left/top 직접 갱신)
  const hotspotDomRef = useRef<Map<string, HTMLDivElement>>(new Map());
  // useEffect 클로저 밖에서 선택 로직 호출용
  const selectByKey   = useRef<((key: string | null) => void) | null>(null);

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
    keyLight.shadow.camera.far  = 30;
    keyLight.shadow.bias        = -0.001;
    scene.add(keyLight);
    const rimLight  = new THREE.DirectionalLight(0xffffff, 3.0); rimLight.position.set(4, 2, -5);    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5); fillLight.position.set(0, -3, 2);   scene.add(fillLight);
    scene.add(new THREE.AmbientLight(0x222222, 0.4));
    scene.add(new THREE.HemisphereLight(0x000000, 0x331100, 0.3));

    // ── OrbitControls ──────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.06;
    controls.minDistance     = 1.5;
    controls.maxDistance     = 12;
    controls.maxPolarAngle   = Math.PI * 0.85;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.6;
    controls.enablePan       = false;

    const onStart = () => { controls.autoRotate = false; };
    const onEnd   = () => { controls.autoRotate = true; };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end",   onEnd);

    // ── Grid ──────────────────────────────────────────────────────────────
    const grid = new THREE.GridHelper(20, 40, 0x111111, 0x0a0a0a);
    grid.position.y = -1.2;
    scene.add(grid);

    // ── 파트 선택 내부 상태 ────────────────────────────────────────────────
    const raycaster    = new THREE.Raycaster();
    const mouse        = new THREE.Vector2();
    const meshToKey    = new Map<THREE.Mesh, string>();
    const origEmissive = new Map<THREE.Mesh, { color: THREE.Color; intensity: number }>();
    let   selectedMesh: THREE.Mesh | null = null;
    let   pointerDownX = 0, pointerDownY = 0, hasDragged = false;

    const getMeshes = () => Array.from(meshToKey.keys());

    const highlight = (mesh: THREE.Mesh) => {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach(m => { if (m instanceof THREE.MeshStandardMaterial) { m.emissive.set(0x2266ee); m.emissiveIntensity = 0.4; } });
    };
    const restore = (mesh: THREE.Mesh) => {
      const orig = origEmissive.get(mesh);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach(m => { if (m instanceof THREE.MeshStandardMaterial) { m.emissive.copy(orig?.color ?? new THREE.Color(0)); m.emissiveIntensity = orig?.intensity ?? 0; } });
    };

    // 외부(hotspot 버튼)에서 key로 선택할 수 있도록 ref에 노출
    selectByKey.current = (key: string | null) => {
      if (selectedMesh) { restore(selectedMesh); selectedMesh = null; }
      if (!key) { setSelectedKey(null); return; }
      meshToKey.forEach((k, m) => { if (k === key) { highlight(m); selectedMesh = m; } });
      setSelectedKey(key);
    };

    // ── GLB 로드 ───────────────────────────────────────────────────────────
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

        const box    = new THREE.Box3().setFromObject(model);
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

          const key = mesh.name || mesh.parent?.name || `mesh_${meshToKey.size}`;
          meshToKey.set(mesh, key);

          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const first = mats[0];
          if (first instanceof THREE.MeshStandardMaterial) {
            origEmissive.set(mesh, { color: first.emissive.clone(), intensity: first.emissiveIntensity });
          }
          mats.forEach(m => { if (m instanceof THREE.MeshStandardMaterial) m.envMapIntensity = 0.6; });
        });

        scene.add(model);

        // ── 핫스팟 3D 위치 계산 (월드 매트릭스 확정 후) ──────────────────
        if (partsRef.current) {
          model.updateWorldMatrix(true, true);
          const seen = new Set<string>();
          meshToKey.forEach((key, mesh) => {
            if (seen.has(key)) return;
            seen.add(key);
            const bbox = new THREE.Box3().setFromObject(mesh);
            hotspot3DPos.current.set(key, bbox.getCenter(new THREE.Vector3()));
          });
          setHotspotKeys(Array.from(seen));
        }

        if (gltf.animations.length > 0) {
          animMixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(clip => animMixer!.clipAction(clip).play());
        }
        setLoading(false);
      },
      (xhr) => { if (xhr.lengthComputable) setProgress(Math.round((xhr.loaded / xhr.total) * 100)); },
      (err) => { const msg = err instanceof Error ? err.message : String(err); console.error(msg); setError(msg); setLoading(false); }
    );

    // ── Pointer: drag vs click 구별 ────────────────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      hasDragged = false; pointerDownX = e.clientX; pointerDownY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownX, dy = e.clientY - pointerDownY;
      if (dx * dx + dy * dy > 25) hasDragged = true;
      if (!partsRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      renderer.domElement.style.cursor = raycaster.intersectObjects(getMeshes()).length > 0 ? "pointer" : "";
    };
    const onPointerUp = (e: PointerEvent) => {
      if (hasDragged || !partsRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(getMeshes());
      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Mesh;
        const key = meshToKey.get(hit) ?? null;
        if (selectedMesh === hit) { restore(hit); selectedMesh = null; setSelectedKey(null); }
        else { if (selectedMesh) restore(selectedMesh); highlight(hit); selectedMesh = hit; setSelectedKey(key); }
      } else {
        if (selectedMesh) { restore(selectedMesh); selectedMesh = null; }
        setSelectedKey(null);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup",   onPointerUp);

    // ── Render loop ────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      animMixer?.update(clock.getDelta());
      controls.update();
      renderer.render(scene, camera);

      // 핫스팟 2D 좌표 갱신 (매 프레임, React state 없이 DOM 직접 조작)
      hotspot3DPos.current.forEach((worldPos, key) => {
        const el = hotspotDomRef.current.get(key);
        if (!el) return;
        const v = worldPos.clone().project(camera);
        if (v.z >= 1) { el.style.opacity = "0"; el.style.pointerEvents = "none"; return; }
        const x = ( v.x * 0.5 + 0.5) * mount.clientWidth;
        const y = (-v.y * 0.5 + 0.5) * mount.clientHeight;
        el.style.left          = `${x}px`;
        el.style.top           = `${y}px`;
        el.style.opacity       = "1";
        el.style.pointerEvents = "auto";
      });
    };

    // 뷰어가 화면 밖이면 렌더 루프를 완전히 정지 → 다른 섹션(스크롤 영상 등)
    // 스크롤 시 GPU/CPU 점유 제거. 화면에 다시 들어오면 재개.
    const visObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!rafId) { clock.getDelta(); animate(); } // 누적 delta 버리고 재개
        } else if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { threshold: 0 }
    );
    visObserver.observe(mount);

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
      selectByKey.current = null;
      visObserver.disconnect();
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup",   onPointerUp);
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end",   onEnd);
      controls.dispose(); dracoLoader.dispose(); renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      hotspot3DPos.current.clear();
      hotspotDomRef.current.clear();
    };
  }, [modelPath, cameraZ, rotationY]);

  const partInfo = selectedKey ? parts?.[selectedKey] : null;

  return (
    // data-lenis-prevent-touch: Lenis syncTouch가 켜진 페이지(예: wasper-3)에서 이 영역의
    // 터치를 가로채지 않도록 → 모바일에서 OrbitControls 회전이 정상 동작
    <div className="relative w-full h-full" data-lenis-prevent-touch="">
      {/* Three.js canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* ── 핫스팟 마커 ─────────────────────────────────────────────────── */}
      {parts && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {hotspotKeys.map((key) => {
            const isSelected = selectedKey === key;
            return (
              <div
                key={key}
                ref={(el) => {
                  if (el) hotspotDomRef.current.set(key, el);
                  else    hotspotDomRef.current.delete(key);
                }}
                className="absolute pointer-events-auto"
                style={{
                  transform: "translate(-50%, -50%)",
                  opacity: 0,           // RAF 루프가 위치 확정 후 1로 변경
                  transition: "opacity 0.3s ease",
                }}
                onClick={() => {
                  if (selectedKey === key) selectByKey.current?.(null);
                  else                     selectByKey.current?.(key);
                }}
              >
                {/* 외곽 소나 파동 1 */}
                {!isSelected && (
                  <span
                    className="absolute rounded-full border border-white/30"
                    style={{
                      inset: "-10px",
                      animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                  />
                )}
                {/* 외곽 소나 파동 2 (딜레이) */}
                {!isSelected && (
                  <span
                    className="absolute rounded-full border border-white/15"
                    style={{
                      inset: "-16px",
                      animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
                      animationDelay: "0.5s",
                    }}
                  />
                )}
                {/* 메인 원형 버튼 */}
                <div
                  className="relative flex items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    width: 32,
                    height: 32,
                    background: isSelected ? "rgba(34,102,238,0.55)" : "rgba(0,0,0,0.45)",
                    border: isSelected ? "2px solid rgba(100,160,255,0.9)" : "1.5px solid rgba(255,255,255,0.65)",
                    boxShadow: isSelected ? "0 0 14px rgba(34,102,238,0.6)" : "0 0 8px rgba(255,255,255,0.1)",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    cursor: "pointer",
                  }}
                >
                  {/* 내부 채움 파동 (선택 전) */}
                  {!isSelected && (
                    <span
                      className="absolute inset-0 rounded-full bg-white/10"
                      style={{ animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite", animationDelay: "0.25s" }}
                    />
                  )}
                  {/* 센터 도트 */}
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: isSelected ? 8 : 6,
                      height: isSelected ? 8 : 6,
                      background: isSelected ? "rgba(180,210,255,1)" : "rgba(255,255,255,0.9)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 파트 정보 패널 ────────────────────────────────────────────────── */}
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
              zIndex: 3,
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

      {/* ── 로딩 ──────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
          <div className="mb-6 text-[10px] tracking-[0.5em] text-white/30 font-mono uppercase">Loading Model</div>
          <div className="w-48 h-px bg-white/10 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-white transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 text-[9px] tracking-[0.3em] text-white/20 font-mono">{progress}%</div>
        </div>
      )}

      {/* ── 에러 ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <p className="text-white/40 text-sm font-mono tracking-widest">{error}</p>
        </div>
      )}

      {/* ── HUD ───────────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-6 pointer-events-none" style={{ zIndex: 3 }}>
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

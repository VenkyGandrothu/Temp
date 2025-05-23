/* src/Components/ModelViewer.js */
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../Styles/ModelViewer.css';

export default function ModelViewer({ url }) {
  const containerRef = useRef();
  const canvasRef = useRef();
  const animationIdRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    canvasRef.current = renderer.domElement;

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemi.position.set(0, 20, 0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 10, 10);
    scene.add(dir);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Load GLTF
    const loader = new GLTFLoader();
    loader.load(
      url,
      gltf => {
        const model = gltf.scene;
        scene.add(model);

        // Compute bounding box and sphere
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const sphere = box.getBoundingSphere(new THREE.Sphere());

        // Recentering model: center on origin and sit on ground
        model.position.sub(center);
        model.position.y += size.y / 2;

        // Position camera so model fits in view
        const radius = sphere.radius;
        const camDist = radius * 2;
        camera.position.set(0, radius, camDist);
        controls.target.set(0, 0, 0);
        controls.update();

        console.log(`Model size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
      },
      xhr => console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`),
      err => console.error('Error loading model:', err)
    );

    // Render loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (container && canvasRef.current) container.removeChild(canvasRef.current);
      scene.clear();
    };
  }, [url]);

  return <div ref={containerRef} className="model-viewer-container" />;
}

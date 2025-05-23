import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ModelViewer({ url }) {
  const containerRef = useRef();
  // refs to hold values across renders
  const canvasRef = useRef();
  const animationIdRef = useRef();

  useEffect(() => {
    const container = containerRef.current;

    // 1) Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    // store the canvas so we can remove it later
    canvasRef.current = renderer.domElement;

    // 2) Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 10, 10);
    scene.add(dirLight);

    // 3) Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();

    // 4) Load GLTF
    const loader = new GLTFLoader();
    let model;
    loader.load(
      url,
      gltf => {
        model = gltf.scene;
        scene.add(model);
      },
      xhr => {
        console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
      },
      error => console.error('Error loading model:', error)
    );

    // 5) Render loop
    const clock = new THREE.Clock();
    const animate = () => {
      // schedule next frame and remember its ID
      animationIdRef.current = requestAnimationFrame(animate);

      if (model) {
        model.rotation.y += 0.01 * clock.getDelta();
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 6) Cleanup on unmount
    return () => {
      // cancel the scheduled frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
      // only remove the canvas if the container still exists
      if (container && canvasRef.current) {
        container.removeChild(canvasRef.current);
      }
      scene.clear();
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100vh', overflow: 'hidden' }}
    />
  );
}

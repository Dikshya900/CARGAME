import React, { useEffect, useMemo, useRef, useState } from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import * as THREE from 'https://unpkg.com/three@0.170.0/build/three.module.js';
import { LANES, hasCollision, makeObstacle, recycleObstacle, shiftLane } from './gameLogic.js';

function GameCanvas({ lane, running, crashed, onCrash, tick }) {
  const mountRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#04020c', 24, 210);

    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 550);
    camera.position.set(0, 8.8, 18);
    camera.lookAt(0, 1, -22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight('#8bc4ff', '#0b0718', 1.1);
    scene.add(hemi);
    const dirLight = new THREE.DirectionalLight('#b8ffff', 1.6);
    dirLight.position.set(8, 18, 14);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const neon = new THREE.PointLight('#37f6ff', 5, 38);
    neon.position.set(0, 2, 11);
    scene.add(neon);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 420),
      new THREE.MeshStandardMaterial({ color: '#0a0812', roughness: 0.84, metalness: 0.32 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.z = -140;
    road.receiveShadow = true;
    scene.add(road);

    const laneLines = [];
    for (let i = 0; i < 3; i += 1) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 420),
        new THREE.MeshBasicMaterial({ color: '#cb2dff' })
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(LANES[i], 0.03, -140);
      laneLines.push(line);
      scene.add(line);
    }

    const strips = [];
    for (let i = 0; i < 24; i += 1) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35, 8),
        new THREE.MeshBasicMaterial({ color: '#35f3ff' })
      );
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(0, 0.04, -i * 15);
      strips.push(strip);
      scene.add(strip);
    }

    const player = new THREE.Group();
    const baseCar = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.8, 4),
      new THREE.MeshStandardMaterial({ color: '#6ef8ff', emissive: '#103b53', metalness: 0.86, roughness: 0.2 })
    );
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.5, 1.8),
      new THREE.MeshStandardMaterial({ color: '#090d1f', metalness: 0.5, roughness: 0.08 })
    );
    canopy.position.set(0, 0.6, -0.3);
    player.add(baseCar, canopy);
    player.position.set(LANES[lane], 0.52, 9);
    player.castShadow = true;
    scene.add(player);

    const starGeometry = new THREE.BufferGeometry();
    const stars = new Float32Array(4500 * 3);
    for (let i = 0; i < 4500; i += 1) {
      stars[i * 3] = (Math.random() - 0.5) * 350;
      stars[i * 3 + 1] = Math.random() * 180;
      stars[i * 3 + 2] = (Math.random() - 0.5) * 350;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
    const starPoints = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: '#8ec5ff', size: 0.4, sizeAttenuation: true })
    );
    scene.add(starPoints);

    const obstacles = Array.from({ length: 16 }).map((_, i) => makeObstacle(-40 - i * 22));
    const obstacleMeshes = obstacles.map((obstacle) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(obstacle.width, 1.1, obstacle.depth),
        new THREE.MeshStandardMaterial({ color: '#ff7a00', emissive: '#7b3006', metalness: 0.66, roughness: 0.34 })
      );
      mesh.position.set(LANES[obstacle.lane], 0.6, obstacle.z);
      mesh.castShadow = true;
      scene.add(mesh);
      return mesh;
    });

    const clock = new THREE.Clock();

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.04);
      player.position.x += (LANES[lane] - player.position.x) * Math.min(delta * 12, 1);
      player.rotation.z = (LANES[lane] - player.position.x) * 0.12;
      player.position.y = crashed ? 0.72 : 0.52;
      baseCar.material.emissive.set(crashed ? '#7f1330' : '#103b53');

      strips.forEach((strip) => {
        strip.position.z += delta * 48;
        if (strip.position.z > 16) {
          strip.position.z = -340;
        }
      });

      if (running) {
        obstacles.forEach((obstacle, index) => {
          obstacle.z += delta * 58 * obstacle.speed;
          if (obstacle.z > 16) {
            obstacles[index] = recycleObstacle(obstacle);
            obstacle = obstacles[index];
          }

          obstacleMeshes[index].position.x = LANES[obstacle.lane];
          obstacleMeshes[index].position.z = obstacle.z;
          obstacleMeshes[index].rotation.y += delta * 0.65;

          if (hasCollision(lane, obstacle)) {
            onCrash();
          }
        });
      }

      neon.color.set(crashed ? '#ff3c76' : '#37f6ff');
      starPoints.rotation.y += delta * 0.02;
      renderer.render(scene, camera);
      gameRef.current = requestAnimationFrame(animate);
    };

    gameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(gameRef.current);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [lane, running, crashed, onCrash, tick]);

  return React.createElement('div', { className: 'canvas-host', ref: mountRef });
}

function App() {
  const [lane, setLane] = useState(1);
  const [running, setRunning] = useState(true);
  const [crashed, setCrashed] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setScore((s) => s + 1), 100);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        setLane((l) => shiftLane(l, -1));
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        setLane((l) => shiftLane(l, 1));
      }
      if (event.code === 'Space' && crashed) {
        restart();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [crashed]);

  const onCrash = () => {
    setRunning(false);
    setCrashed(true);
    setBest((b) => Math.max(b, score));
  };

  const restart = () => {
    setLane(1);
    setScore(0);
    setCrashed(false);
    setRunning(true);
    setTick((t) => t + 1);
  };

  const scoreText = useMemo(() => (score / 10).toFixed(1), [score]);

  return React.createElement(
    'div',
    { className: 'app-shell' },
    React.createElement(GameCanvas, { lane, running, crashed, onCrash, tick }),
    React.createElement(
      'section',
      { className: 'hud', role: 'status' },
      React.createElement('h1', null, 'Neo Highway Rush'),
      React.createElement('p', { className: 'score' }, `Score: ${scoreText}s`),
      React.createElement('p', { className: 'best' }, `Best: ${(best / 10).toFixed(1)}s`),
      React.createElement('p', { className: 'hint' }, 'Move: ← / → or A / D'),
      crashed
        ? React.createElement('p', { className: 'crash' }, 'Crashed! Press Space to restart.')
        : React.createElement('p', { className: 'survive' }, 'Avoid traffic and keep your streak alive.')
    )
  );
}

createRoot(document.getElementById('root')).render(React.createElement(App));

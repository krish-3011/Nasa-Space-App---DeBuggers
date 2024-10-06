// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Set background to black

// Create a camera (perspective)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 100, 300); // Position the camera to see

// Create a WebGL renderer and attach it to the document
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Import OrbitControls
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
document.head.appendChild(script);

// Wait for the script to load
script.onload = function () {
  // Add orbit controls (for zooming, rotating, panning)
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // For smooth controls
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true; // Enable panning
  controls.screenSpacePanning = true; // Enable screen space panning
  controls.maxPolarAngle = Math.PI / 2; // Limit camera rotation to prevent flipping
  controls.minPolarAngle = 0; // Limit camera rotation to prevent flipping

  // Create a point light (to simulate the Sun's light)
  const pointLight = new THREE.PointLight(0xffffff, 2, 2000);
  pointLight.position.set(0, 0, 0); // Light positioned at the Sun
  scene.add(pointLight);

  // Add some ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add a Sun (Yellow sphere in the center)
  const sunGeometry = new THREE.SphereGeometry(30, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sun);

  // Function to create planets with orbit paths
  function createPlanet(radius, distanceFromSun, color, orbitSpeed) {
    const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({ color: color });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    // Create a group to rotate around the Sun (for orbit)
    const orbit = new THREE.Group();
    orbit.add(planet);
    planet.position.set(distanceFromSun, 0, 0); // Position planet in orbit

    // Add orbit path (circular ring)
    const orbitGeometry = new THREE.RingGeometry(distanceFromSun - 0.5, distanceFromSun + 0.5, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitMesh.rotation.x = Math.PI / 2; // Rotate the ring to lay flat horizontally

    scene.add(orbitMesh); // Add the orbit path to the scene
    scene.add(orbit); // Add the planet's orbit group to the scene

    return { planet, orbit, orbitSpeed, distanceFromSun };
  }

  // Planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
  const planets = [
    createPlanet(5, 60, 0xaaaaaa, 0.02),  // Mercury
    createPlanet(7, 100, 0xffaa00, 0.015), // Venus
    createPlanet(10, 150, 0x0000ff, 0.01), // Earth
    createPlanet(8, 200, 0xff0000, 0.008), // Mars
    createPlanet(15, 280, 0x884400, 0.005), // Jupiter
    createPlanet(12, 350, 0xffff00, 0.004), // Saturn
    createPlanet(10, 420, 0x00aaff, 0.003), // Uranus
    createPlanet(9, 500, 0x0000aa, 0.002), // Neptune
  ];

  // Raycaster for mouse click detection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Variables to track clicked planet
  let targetPlanet = null;
  let isFollowing = false;
  let followHeight = 50; // Height above the planet

  // Event listener for mouse click
  document.addEventListener('click', (event) => {
    // Get the mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Cast a ray from the camera through the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check if the ray intersects with any of the planets
    const intersects = raycaster.intersectObjects(planets.map(({ planet }) => planet));

    if (intersects.length > 0) {
      // Get the planet that was clicked
      const clickedPlanet = intersects[0].object;

      // Set the clicked planet as the target
      targetPlanet = planets.find(p => p.planet === clickedPlanet);
      isFollowing = true;

      // Zoom towards the planet with animation
      const initialCameraPosition = camera.position.clone();
      const targetPosition = clickedPlanet.position.clone();

      // Move the camera above the planet
      targetPosition.y += followHeight; // Move the camera to a fixed height above the planet

      const animationDuration = 2000; // 2 seconds
      let startTime = Date.now();

      // Function to animate the zoom-in
      function animateZoom() {
        const currentTime = Date.now();
        const progress = (currentTime - startTime) / animationDuration;
        if (progress < 1) {
          // Gradually move the camera to the target position
          camera.position.lerpVectors(initialCameraPosition, targetPosition, progress);
          requestAnimationFrame(animateZoom);
        } else {
          camera.position.copy(targetPosition);
          controls.update();
        }
      }

      animateZoom(); // Start zoom animation
    }
  });

  // Function to follow the planet after zooming in
  function followPlanet() {
    if (isFollowing && targetPlanet) {
      const { planet, orbitSpeed, distanceFromSun } = targetPlanet;

      // Calculate the new position based on time
      const time = Date.now() * orbitSpeed; // Scale the time to match the planet's orbit speed
      const cameraHeight = followHeight; // Define the height above the planet

      // Follow the planet's position
      const planetX = distanceFromSun * Math.cos(time);
      const planetZ = distanceFromSun * Math.sin(time);

      // Update planet's position
      planet.position.set(planetX, 0, planetZ);

      // Move the camera along with the planet and keep the height fixed
      camera.position.set(planetX, cameraHeight, planetZ + 100); // Keep camera a bit behind the planet
      camera.lookAt(planet.position); // Ensure the camera looks at the planet
    }
  }

  // Animate the scene
  function animate() {
    requestAnimationFrame(animate);

    // Rotate the planets around the Sun
    planets.forEach(({ orbit, orbitSpeed }) => {
      orbit.rotation.y += orbitSpeed;
    });

    followPlanet(); // Follow the planet if necessary

    // Update the camera controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
  }

  animate(); // Start the animation loop
};
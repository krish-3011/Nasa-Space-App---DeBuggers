// Create a scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Set background to black

// Create a camera (perspective)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 100, 300); // Position the camera

// Create a WebGL renderer and attach it to the document
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Import OrbitControls
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
document.head.appendChild(script);

// Create an HTML element to display satellite info
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '10px';
infoDiv.style.right = '10px';
infoDiv.style.padding = '10px';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoDiv.style.color = 'white';
infoDiv.style.fontFamily = 'Arial';
infoDiv.style.maxWidth = '300px';
document.body.appendChild(infoDiv);

// Function to create satellites with random orbits around Earth
function createSatellite(name, radius, distanceFromEarth, orbitSpeed, info) {
  const satelliteGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const satelliteMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 }); // Silver color
  const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);

  // Create a group to rotate around the Earth (for orbit)
  const orbit = new THREE.Group();
  orbit.add(satellite);
  satellite.position.set(distanceFromEarth, 0, 0); // Position satellite in orbit

  // Randomize orbit orientation
  orbit.rotation.x = Math.random() * Math.PI * 2; // Random tilt in x
  orbit.rotation.z = Math.random() * Math.PI * 2; // Random tilt in z

  scene.add(orbit); // Add the satellite's orbit group to the scene

  return { name, satellite, orbit, orbitSpeed, distanceFromEarth, info };
}

// Create Earth at the center
const earthGeometry = new THREE.SphereGeometry(15, 32, 32);
const earthMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Create the moon in a fixed orbit
const moonRadius = 90;
const moonOrbitSpeed = 0.01; // Adjust speed as needed
const moonGeometry = new THREE.SphereGeometry(5, 32, 32);
const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 }); // Silver color for the moon
const moon = new THREE.Mesh(moonGeometry, moonMaterial);

// Create a group for the moon's orbit
const moonOrbit = new THREE.Group();
moonOrbit.add(moon);
scene.add(moonOrbit); // Add the moon's orbit group to the scene

// Position the moon in its initial orbit
moon.position.set(moonRadius, 0, 0);

// Create a starry background
const starTexture = new THREE.TextureLoader().load('https://www.transparenttextures.com/patterns/stars.png'); // Replace with your star texture URL
const starGeometry = new THREE.SphereGeometry(500, 32, 32);
const starMaterial = new THREE.MeshBasicMaterial({ map: starTexture, side: THREE.BackSide });
const stars = new THREE.Mesh(starGeometry, starMaterial);
scene.add(stars);

// Create 20 small satellites (silver) orbiting close to Earth
const satellitesData = [
  { name: "International Space Station (ISS)", distanceFromEarth: 25, orbitSpeed: 0.03, info: "Research Lab in Low Earth Orbit" },
  { name: "Hubble Space Telescope", distanceFromEarth: 28, orbitSpeed: 0.02, info: "Space Telescope for Astronomy" },
  { name: "GPS IIF-1", distanceFromEarth: 30, orbitSpeed: 0.01, info: "Global Positioning System" },
  { name: "Tiangong Space Station", distanceFromEarth: 26, orbitSpeed: 0.025, info: "Chinese Space Station" },
  { name: "Chandra X-ray Observatory", distanceFromEarth: 35, orbitSpeed: 0.015, info: "Space Observatory for X-rays" },
  { name: "Galileo Satellite", distanceFromEarth: 28, orbitSpeed: 0.017, info: "Global Navigation Satellite System" },
  { name: "James Webb Space Telescope", distanceFromEarth: 32, orbitSpeed: 0.008, info: "Infrared Space Telescope" },
  { name: "GOES-16", distanceFromEarth: 37, orbitSpeed: 0.007, info: "Weather Monitoring Satellite" },
  { name: "Voyager 1", distanceFromEarth: 38, orbitSpeed: 0.006, info: "Interstellar Space Probe" },
  { name: "Envisat", distanceFromEarth: 32, orbitSpeed: 0.013, info: "Environmental Satellite" },
  { name: "INSAT-3D", distanceFromEarth: 29, orbitSpeed: 0.011, info: "Indian Weather Satellite" },
  { name: "Aqua", distanceFromEarth: 33, orbitSpeed: 0.009, info: "Earth Science Satellite" },
  { name: "Terra", distanceFromEarth: 31, orbitSpeed: 0.012, info: "Earth Observation Satellite" },
  { name: "Globalstar-1", distanceFromEarth: 30, orbitSpeed: 0.01, info: "Global Communications Satellite" },
  { name: "MAVEN", distanceFromEarth: 34, orbitSpeed: 0.005, info: "Mars Atmosphere and Volatile Evolution Mission" },
  { name: "Landsat 8", distanceFromEarth: 33, orbitSpeed: 0.007, info: "Earth Imaging Satellite" },
  { name: "Starlink-1000", distanceFromEarth: 26, orbitSpeed: 0.02, info: "Global Internet Satellite" },
  { name: "Juno", distanceFromEarth: 38, orbitSpeed: 0.005, info: "Jupiter Observation Probe" },
  { name: "Sputnik 1", distanceFromEarth: 27, orbitSpeed: 0.03, info: "First Artificial Earth Satellite" },
  { name: "Ariane 5", distanceFromEarth: 32, orbitSpeed: 0.012, info: "Launch Vehicle" }
];

// Create satellites and store them
const satellites = satellitesData.map((satData) => {
  return createSatellite(satData.name, 1, satData.distanceFromEarth, satData.orbitSpeed, satData.info);
});

// Define controls globally to avoid reference error
let controls;

// Function to update satellite info on the right side of the screen
function updateSatelliteInfo() {
  let infoText = `<strong>Satellite Information</strong><br>`;
  infoText += `<strong>Moon</strong>: Earth's natural satellite<br><br>`;
  satellites.forEach((satellite) => {
    infoText += `<strong>${satellite.name}</strong><br>`;
    infoText += `Distance from Earth: ${satellite.distanceFromEarth} km<br>`;
    infoText += `Orbit Speed: ${satellite.orbitSpeed.toFixed(3)}<br>`;
    infoText += `Details: ${satellite.info}<br><br>`;
  });
  infoDiv.innerHTML = infoText;
}

// Function to animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Rotate the moon's orbit around the Earth
  moonOrbit.rotation.y += moonOrbitSpeed;

  satellites.forEach((satellite) => {
    satellite.orbit.rotation.y += satellite.orbitSpeed;
  });

  controls.update(); // Ensure controls are updated
  renderer.render(scene, camera);
  updateSatelliteInfo(); // Update satellite info on the UI
}

script.onload = function () {
  // Initialize controls after the script is loaded
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // For smooth controls
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true; // Enable panning
  controls.screenSpacePanning = true; // Enable screen space panning
  controls.maxPolarAngle = Math.PI / 2; // Limit camera rotation to prevent flipping
  controls.minPolarAngle = 0; // Limit camera rotation to prevent flipping

  // Create a point light (to simulate sunlight)
  const pointLight = new THREE.PointLight(0xffffff, 2, 2000);
  pointLight.position.set(100, 100, 100); // Position light away from Earth
  scene.add(pointLight);

  // Add some ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Start animating the scene
  animate();
};

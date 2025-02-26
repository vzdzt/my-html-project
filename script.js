// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('universe'), 
    alpha: true,
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.z = 1000;

// Initialize geometry
const geometry = new THREE.BufferGeometry();
const vertices = [];
const colors = [];

for (let i = 0; i < 15000; i++) {
    vertices.push(
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000
    );
    const color = new THREE.Color();
    color.setHSL(Math.random(), 0.8, 0.8);
    colors.push(color.r, color.g, color.b);
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// Track mouse position
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
});

// Comet effect
class Comet {
    constructor() {
        this.position = new THREE.Vector3(
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000,
            Math.random() * 2000 - 1000
        );
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        this.trail = [];
        this.trailLength = 20;

        const geometry = new THREE.SphereGeometry(2, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0x00f7ff),
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
    }

    update() {
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);

        this.trail.push(this.position.clone());
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        if (Math.abs(this.position.x) > 1000 || 
            Math.abs(this.position.y) > 1000 || 
            Math.abs(this.position.z) > 1000) {
            this.position.set(
                Math.random() * 2000 - 1000,
                Math.random() * 2000 - 1000,
                Math.random() * 2000 - 1000
            );
            this.trail = [];
        }
    }
}

const comets = Array(5).fill(null).map(() => new Comet());
const supernovas = [];

function createSupernova(x, y, z) {
    const particles = new THREE.BufferGeometry();
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        const radius = Math.random() * 5;
        const velocity = Math.random() * 30 + 20;

        positions[i * 3] = x + Math.sin(theta) * Math.cos(phi) * radius;
        positions[i * 3 + 1] = y + Math.sin(theta) * Math.sin(phi) * radius;
        positions[i * 3 + 2] = z + Math.cos(theta) * radius;

        velocities.push({
            x: velocity * Math.sin(theta) * Math.cos(phi),
            y: velocity * Math.sin(theta) * Math.sin(phi),
            z: velocity * Math.cos(theta)
        });

        colors[i * 3] = 1;
        colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
        colors[i * 3 + 2] = Math.random() * 0.2;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 8,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const points = new THREE.Points(particles, material);
    scene.add(points);

    return { points, velocities };
}

function updateSupernovas() {
    for (let i = supernovas.length - 1; i >= 0; i--) {
        const supernova = supernovas[i];
        const positions = supernova.points.geometry.attributes.position.array;
        const colors = supernova.points.geometry.attributes.color.array;

        for (let j = 0; j < positions.length; j += 3) {
            positions[j] += supernova.velocities[j/3].x;
            positions[j + 1] += supernova.velocities[j/3].y;
            positions[j + 2] += supernova.velocities[j/3].z;

            const alpha = 1 - (supernova.age / supernova.maxAge);
            colors[j] *= alpha;
            colors[j + 1] *= alpha;
            colors[j + 2] *= alpha;
        }

        supernova.points.geometry.attributes.position.needsUpdate = true;
        supernova.points.geometry.attributes.color.needsUpdate = true;
        supernova.points.material.opacity = 1 - (supernova.age / supernova.maxAge);

        supernova.age++;

        if (supernova.age >= supernova.maxAge) {
            scene.remove(supernova.points);
            supernovas.splice(i, 1);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    comets.forEach(comet => comet.update());

    points.rotation.x += 0.0002;
    points.rotation.y += 0.0003;

    points.rotation.x += (mouseY - points.rotation.x) * 0.05;
    points.rotation.y += (mouseX - points.rotation.y) * 0.05;

    const time = Date.now() * 0.001;
    points.scale.x = points.scale.y = points.scale.z = Math.sin(time) * 0.15 + 1;

    const positions = points.geometry.attributes.position.array;
    const colors = points.geometry.attributes.color.array;
    for(let i = 0; i < colors.length; i += 3) {
        colors[i] = Math.sin(time + positions[i] * 0.001) * 0.5 + 0.5;
        colors[i + 1] = Math.cos(time + positions[i + 1] * 0.001) * 0.5 + 0.5;
        colors[i + 2] = Math.sin(time + positions[i + 2] * 0.002) * 0.5 + 0.5;
    }
    points.geometry.attributes.color.needsUpdate = true;

    updateSupernovas();
    renderer.render(scene, camera);
}

// Initialize
animate();

// Event Listeners
document.getElementById('universe').addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const vector = new THREE.Vector3(x * 1000, y * 1000, 0);
    const supernova = createSupernova(vector.x, vector.y, vector.z);
    supernovas.push({ 
        ...supernova, 
        age: 0,
        maxAge: 100 
    });
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    let width = 0;
    const interval = setInterval(() => {
        width += 2;
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = width + '%';
        }
        if (width >= 100) {
            clearInterval(interval);
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }
        }
    }, 20);
});

// Landing page handler
document.getElementById('landing-page').addEventListener('click', () => {
    const landingPage = document.getElementById('landing-page');
    landingPage.classList.add('fade-out');
    setTimeout(initializeQuotes, 100);
});

// Custom cursor
const cursor = document.getElementById('cursor');
const cursorBlur = document.getElementById('cursor-blur');

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    cursorBlur.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
});

// Sound effects
function playRandomSound() {
    // Disabled for now to prevent errors
    return;
}

// Add hover sound effects
document.querySelectorAll('.nav-links a, .social-button, .glass-card, .button').forEach(element => {
    element.addEventListener('mouseenter', playRandomSound);
});

// Quotes system
const quotes = [
    { text: "Music expresses that which cannot be put into words and that which cannot remain silent.", author: "Victor Hugo" },
    { text: "One good thing about music, when it hits you, you feel no pain.", author: "Bob Marley" },
    { text: "Music is the universal language of mankind.", author: "Henry Wadsworth Longfellow" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Life is not about waiting for the storm to pass, it's about learning to dance in the rain.", author: "Vivian Greene" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
    { text: "You never fail until you stop trying.", author: "Albert Einstein" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Success is not built on success. It's built on failure. It's built on frustration. Sometimes it's built on catastrophe.", author: "Sumner Redstone" },
    { text: "The music is not in the notes, but in the silence between.", author: "Wolfgang Amadeus Mozart" },
    { text: "Music washes away from the soul the dust of everyday life.", author: "Berthold Auerbach" },
    { text: "Music is a higher revelation than all wisdom and philosophy.", author: "Ludwig van Beethoven" },
    { text: "Life seems to go on without effort when I am filled with music.", author: "George Eliot" },
    { text: "Music is the soundtrack of your life.", author: "Dick Clark" },
    { text: "Music touches us emotionally, where words alone can't.", author: "Johnny Depp" },
    { text: "If music be the food of love, play on.", author: "William Shakespeare" },
    { text: "Music is the great uniter. An incredible force.", author: "Dave Matthews" },
    { text: "Music is like a dream. One that I cannot hear.", author: "Ludwig van Beethoven" },
    { text: "Music is the divine way to tell beautiful, poetic things to the heart.", author: "Pablo Casals" },
    { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" },
    { text: "I think it is possible for ordinary people to choose to be extraordinary.", author: "Elon Musk" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Persistence is very important. You should not give up unless you are forced to give up.", author: "Elon Musk" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
];

function getNewQuote() {
    const quoteTexts = document.querySelectorAll('.quote-text');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteContent = `
        <div class="quote-content">${randomQuote.text.split('').map(char => 
            char === ' ' ? ' ' : `<span>${char}</span>`
        ).join('')}</div>
        <div class="quote-author">- ${randomQuote.author}</div>
    `;
    quoteTexts.forEach(quoteText => {
        quoteText.innerHTML = quoteContent;
    });
}

function showContent(contentType) {
    // Hide all content sections first
    document.querySelectorAll('.content-details').forEach(content => {
        content.style.opacity = '0';
        setTimeout(() => {
            content.style.display = 'none';
        }, 300);
    });

    // Show selected content
    const selectedContent = document.getElementById(`content-${contentType}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
        // Force a reflow
        selectedContent.offsetHeight;
        selectedContent.style.opacity = '1';
        selectedContent.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize content display
document.addEventListener('DOMContentLoaded', () => {
    // Hide all content sections initially
    document.querySelectorAll('.content-details').forEach(content => {
        content.style.display = 'none';
    });
});

function initializeQuotes() {
    const quoteContainers = document.querySelectorAll('.quote-text');
    if (quoteContainers.length > 0) {
        getNewQuote();
    }
}

document.addEventListener('DOMContentLoaded', initializeQuotes);

// Music player functionality
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');

if (bgMusic && musicToggle) {
    bgMusic.volume = 0.5;

    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play()
                .then(() => {
                    musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(err => {
                    console.error('Audio playback error:', err);
                });
        } else {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        }
    });
}

// Add 3D tilt effect to cards
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
    });

    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rotateX', '0deg');
        card.style.setProperty('--rotateY', '0deg');
    });
});

// Reinitialize quotes when landing page is clicked
document.getElementById('landing-page').addEventListener('click', () => {
    setTimeout(initializeQuotes, 100);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// GSAP animations
gsap.registerPlugin(ScrollTrigger);

gsap.to('.hero', {
    yPercent: 50,
    ease: "none",
    scrollTrigger: {
        trigger: '.hero',
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

gsap.from('.glass-card', {
    duration: 1.2,
    y: 100,
    opacity: 0,
    rotation: 5,
    stagger: 0.2,
    ease: 'elastic.out(1, 0.75)',
    scrollTrigger: {
        trigger: '.grid',
        start: 'top center+=100',
        toggleActions: 'play none none reverse'
    }
});

document.querySelectorAll('.glass-card').forEach(card => {
    let bounds = card.getBoundingClientRect();
    let mouseLeaveDelay;

    const mouseEnter = (e) => {
        clearTimeout(mouseLeaveDelay);
        bounds = card.getBoundingClientRect();
    };

    const mouseMove = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const leftX = mouseX - bounds.x;
        const topY = mouseY - bounds.y;
        const center = {
            x: leftX - bounds.width / 2,
            y: topY - bounds.height / 2
        };
        const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

        card.style.transform = `
            perspective(1000px)
            scale3d(1.07, 1.07, 1.07)
            rotate3d(
                ${center.y / 100},
                ${-center.x / 100},
                0,
                ${Math.log(distance) * 2}deg
            )
        `;
        card.style.filter = `brightness(1.1) contrast(1.1)`;
    };

    const mouseLeave = () => {
        mouseLeaveDelay = setTimeout(() => {
            card.style.transform = `
                perspective(1000px)
                scale3d(1, 1, 1)
                rotate3d(0, 0, 0, 0)
            `;
            card.style.filter = 'brightness(1) contrast(1)';
        }, 100);
    };

    card.addEventListener('mouseenter', mouseEnter);
    card.addEventListener('mousemove', mouseMove);
    card.addEventListener('mouseleave', mouseLeave);

    gsap.to(card, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

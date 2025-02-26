// Three.js and animation setup
// Scene already declared in index.html
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('universe'), 
    alpha: true,
    antialias: true 
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

let mouseX = 0, mouseY = 0;
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
    { text: "Where words fail, music speaks.", author: "Hans Christian Andersen" },
    { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
    { text: "Music is the strongest form of magic.", author: "Marilyn Manson" },
    { text: "Music produces a kind of pleasure which human nature cannot do without.", author: "Confucius" }
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

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

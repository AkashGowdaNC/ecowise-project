// Premium Home Page JavaScript with Advanced Animations - FIXED VERSION
console.log("🚀 Premium EcoWise Home Page Loaded");

// Initialize AOS (Animate On Scroll)
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}

// Fixed Counter Animation for Stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-item');
    
    counters.forEach((counter, index) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const suffix = counter.textContent.includes('T') ? 'T' : '';
        let count = 0;
        const duration = 2000;
        const increment = target / (duration / 16);
        
        // Set initial value to 0
        counter.textContent = '0' + suffix;
        
        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.textContent = Math.floor(count) + suffix;
                requestAnimationFrame(updateCount);
            } else {
                counter.textContent = target + suffix;
            }
        };
        
        // Stagger the animations
        setTimeout(updateCount, index * 300);
    });
}

// Floating Cards Parallax Effect
function initParallax() {
    const cards = document.querySelectorAll('.card');
    
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        cards.forEach(card => {
            const speed = parseFloat(card.getAttribute('data-speed')) || 0.02;
            const x = (mouseX - 0.5) * speed * 100;
            const y = (mouseY - 0.5) * speed * 100;
            
            card.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

// Smooth Scrolling
function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Demo Modal Functions
function showDemo() {
    const modal = document.getElementById('demoModal');
    modal.style.display = 'flex';
    
    // Create demo animation
    createDemoAnimation();
}

function closeDemo() {
    const modal = document.getElementById('demoModal');
    modal.style.display = 'none';
}

function createDemoAnimation() {
    const demoVisual = document.querySelector('.demo-animation');
    demoVisual.innerHTML = `
        <div class="demo-flow">
            <div class="demo-step">
                <div class="demo-icon">📸</div>
                <p>Capture Item</p>
            </div>
            <div class="demo-arrow">→</div>
            <div class="demo-step">
                <div class="demo-icon">🤖</div>
                <p>AI Analysis</p>
            </div>
            <div class="demo-arrow">→</div>
            <div class="demo-step">
                <div class="demo-icon">🎯</div>
                <p>Get Recommendations</p>
            </div>
        </div>
    `;
}

// Typing Effect for Hero Title - FIXED VERSION
function initTypingEffect() {
    const titleElement = document.querySelector('.hero-title');
    if (!titleElement) return;
    
    const originalHTML = titleElement.innerHTML;
    titleElement.innerHTML = '';
    titleElement.style.opacity = '1';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalHTML.length) {
            titleElement.innerHTML += originalHTML.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
}

// Particle Effect for Background
function createParticles() {
    const particlesContainer = document.querySelector('.floating-shapes');
    if (!particlesContainer) return;
    
    // Clear existing particles
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'shape';
        particle.style.width = `${Math.random() * 100 + 50}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 6}s`;
        particle.style.background = `linear-gradient(45deg, 
            hsl(${Math.random() * 360}, 70%, 60%), 
            hsl(${Math.random() * 360}, 70%, 60%)
        )`;
        
        particlesContainer.appendChild(particle);
    }
}

// Interactive Background Gradient
function initInteractiveBackground() {
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        document.documentElement.style.setProperty('--mouse-x', x);
        document.documentElement.style.setProperty('--mouse-y', y);
    });
}

// Page Load Animations
function initPageAnimations() {
    // Stagger animation for feature cards
    const features = document.querySelectorAll('.feature-card');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Animate process steps sequentially
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.style.animationDelay = `${index * 0.3}s`;
    });
    
    // Animate hero stats
    const stats = document.querySelector('.hero-stats');
    if (stats) {
        stats.style.opacity = '0';
        stats.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            stats.style.transition = 'all 0.6s ease-out';
            stats.style.opacity = '1';
            stats.style.transform = 'translateY(0)';
        }, 1000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("🏠 Home page DOM loaded");
    
    // Initialize animations with delays
    setTimeout(initTypingEffect, 300);
    setTimeout(animateCounters, 1500); // Start counters after typing
    setTimeout(initParallax, 2000);
    setTimeout(createParticles, 500);
    setTimeout(initInteractiveBackground, 1000);
    setTimeout(initPageAnimations, 800);
    
    console.log("🎉 All premium animations initialized!");
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('demoModal');
    if (e.target === modal) {
        closeDemo();
    }
});

// Add CSS for demo animation
const demoStyles = `
    .demo-flow {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        margin: 2rem 0;
    }
    
    .demo-step {
        text-align: center;
        animation: demoPulse 2s infinite;
    }
    
    .demo-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
    
    .demo-arrow {
        font-size: 2rem;
        color: var(--primary);
        animation: arrowBounce 1s infinite;
    }
    
    @keyframes demoPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    @keyframes arrowBounce {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(5px); }
    }
    
    /* Ensure hero stats are visible */
    .hero-stats {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    /* Counter animation styles */
    .stat-item {
        transition: all 0.3s ease;
    }
`;

// Inject demo styles
const styleSheet = document.createElement('style');
styleSheet.textContent = demoStyles;
document.head.appendChild(styleSheet);
// Emergency counter fix - add this to home.js
function emergencyCounterFix() {
    const counters = document.querySelectorAll('.stat-item');
    const values = [1247, 568, 2];
    
    counters.forEach((counter, index) => {
        if (counter.textContent === '0') {
            counter.textContent = values[index];
            console.log(`✅ Fixed counter ${index}: ${values[index]}`);
        }
    });
}

// Call this as a backup
setTimeout(emergencyCounterFix, 3000);
// Debug function
function debugCounters() {
    console.log("🔍 Debugging counters...");
    
    const counters = document.querySelectorAll('.stat-item');
    console.log(`Found ${counters.length} counters`);
    
    counters.forEach((counter, index) => {
        console.log(`Counter ${index}:`, {
            text: counter.textContent,
            dataCount: counter.getAttribute('data-count'),
            isVisible: counter.offsetParent !== null
        });
    });
}

// Run debug after page load
setTimeout(debugCounters, 1000);
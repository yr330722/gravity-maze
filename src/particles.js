const particles = [];

export const particleManager = {
    // Create a burst of particles at (x, y)
    createBurst(x, y, color = '#00f3ff', count = 10) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: color,
                size: Math.random() * 3 + 1,
                type: 'burst'
            });
        }
    },

    // Create a trail particle at (x, y)
    createTrail(x, y, color = '#00f3ff') {
        particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 0.5, // Shorter life for trail
            color: color,
            size: 4, // Starts slightly smaller than ball radius maybe? Or center dot
            type: 'trail'
        });
    },

    update() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= 0.02; // Decay rate

            if (p.type === 'burst') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity for sparks
            }

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    },

    render(ctx) {
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    },

    clear() {
        particles.length = 0;
    }
};

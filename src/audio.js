// Web Audio API Synthesizer
const AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new AudioContext();

const gainNode = ctx.createGain();
gainNode.connect(ctx.destination);
gainNode.gain.value = 0.3; // Master volume

export const audioManager = {
    init() {
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    },

    playBounce(speed) {
        if (ctx.state === 'suspended') return;

        // Pitch based on speed, clamped
        const velocity = Math.min(speed, 20);
        const frequency = 200 + (velocity * 20);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1 + (velocity * 0.01), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(gainNode);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    },

    playWin() {
        if (ctx.state === 'suspended') return;

        const playNote = (freq, time, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

            gain.gain.setValueAtTime(0.2, ctx.currentTime + time);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + time + duration);

            osc.connect(gain);
            gain.connect(gainNode);

            osc.start(ctx.currentTime + time);
            osc.stop(ctx.currentTime + time + duration);
        };

        // A simple major arpeggio
        playNote(440.00, 0, 0.2); // A4
        playNote(554.37, 0.1, 0.2); // C#5
        playNote(659.25, 0.2, 0.2); // E5
        playNote(880.00, 0.3, 0.6); // A5
    },

    playStart() {
        if (ctx.state === 'suspended') return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }
};

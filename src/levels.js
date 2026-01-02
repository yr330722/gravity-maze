const width = window.innerWidth;
const height = window.innerHeight;
const cx = width / 2;
const cy = height / 2;

export const levels = [
    {
        id: 1,
        name: "The Drop",
        instruction: "Draw a simple ramp to guide the ball.",
        ballPos: { x: cx - 300, y: 100 },
        goalPos: { x: cx + 300, y: height - 100 },
        obstacles: [
            // A floor gap
            { x: cx, y: height, w: width, h: 50, angle: 0 }
        ]
    },
    {
        id: 2,
        name: "The Wall",
        instruction: "Go over the wall!",
        ballPos: { x: 100, y: 100 },
        goalPos: { x: width - 100, y: height - 50 },
        obstacles: [
            // A tall wall in the middle
            { x: cx, y: cy, w: 20, h: 400, angle: 0 },
            // Floor
            { x: cx, y: height, w: width, h: 20, angle: 0 }
        ]
    },
    {
        id: 3,
        name: "Slalom",
        instruction: "Weave through the obstacles.",
        ballPos: { x: cx, y: 50 },
        goalPos: { x: cx, y: height - 50 },
        obstacles: [
            { x: cx - 100, y: 200, w: 200, h: 20, angle: 0.2 },
            { x: cx + 100, y: 400, w: 200, h: 20, angle: -0.2 },
            { x: cx - 100, y: 600, w: 200, h: 20, angle: 0.2 },
        ]
    },
    {
        id: 4,
        name: "The Funnel",
        instruction: "Accuracy matters.",
        ballPos: { x: 100, y: 100 },
        goalPos: { x: cx, y: cy + 100 },
        obstacles: [
            // Left funnel
            { x: cx - 150, y: cy, w: 300, h: 20, angle: 0.5 },
            // Right funnel
            { x: cx + 150, y: cy, w: 300, h: 20, angle: -0.5 },
            // Container box
            { x: cx, y: cy + 200, w: 200, h: 20, angle: 0 },
            { x: cx - 100, y: cy + 150, w: 20, h: 100, angle: 0 },
            { x: cx + 100, y: cy + 150, w: 20, h: 100, angle: 0 },
        ]
    }
];

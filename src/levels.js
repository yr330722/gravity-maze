export const getLevels = () => {
    const width = window.innerWidth || 800;
    const height = window.innerHeight || 600;
    const cx = width / 2;
    const cy = height / 2;

    return [
        {
            id: 1,
            name: "The Drop",
            instruction: "Draw a simple ramp to guide the ball.",
            ballPos: { x: Math.round(cx - 100), y: 150 },
            goalPos: { x: Math.round(cx + 150), y: height - 100 },
            obstacles: [
                { x: cx, y: height - 10, w: width * 2, h: 40, isStatic: true, render: { fillStyle: '#222' } }
            ]
        },
        {
            id: 2,
            name: "The Wall",
            instruction: "Go over the wall!",
            ballPos: { x: 100, y: 150 },
            goalPos: { x: width - 100, y: height - 100 },
            obstacles: [
                { x: cx, y: cy, w: 30, h: 300, isStatic: true },
                { x: cx, y: height - 10, w: width * 2, h: 40, isStatic: true }
            ]
        },
        {
            id: 3,
            name: "Slalom",
            instruction: "Weave through the obstacles.",
            ballPos: { x: cx, y: 100 },
            goalPos: { x: cx, y: height - 150 },
            obstacles: [
                { x: cx - 100, y: 300, w: 200, h: 20, angle: 0.2, isStatic: true },
                { x: cx + 100, y: 500, w: 200, h: 20, angle: -0.2, isStatic: true },
                { x: cx, y: height - 10, w: width * 2, h: 40, isStatic: true }
            ]
        }
    ];
};

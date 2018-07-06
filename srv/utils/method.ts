export function measureDistance(a: { x: number, y: number }, b: { x: number, y: number }) {
    const distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

    return distance;
}
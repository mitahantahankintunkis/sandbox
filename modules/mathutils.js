class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(other) {
        this.x = other.x;
        this.y = other.y;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
    }

    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
    }

    mul(other) {
        this.x *= other.x;
        this.y *= other.y;
    }

    scl(val) {
        this.x *= val;
        this.y *= val;
    }

    nor() {
        let l = this.len();
        this.x /= l;
        this.y /= l;
    }

    lenSqr() {
        return this.x*this.x + this.y*this.y;
    }

    len() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    distSqr(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;

        return dx*dx + dy*dy;
    }

    dist(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;

        return Math.sqrt(dx*dx + dy*dy);
    }

    static delta(v0, v1) {
        return new Vec2(v1.x - v0.x, v1.y - v0.y);
    }
}


class Vec3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(other) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    }

    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
    }

    mul(other) {
        this.x *= other.x;
        this.y *= other.y;
        this.z *= other.z;
    }

    scl(val) {
        this.x *= val;
        this.y *= val;
        this.z *= val;
    }

    nor() {
        let l = this.len();
        this.x /= l;
        this.y /= l;
        this.z /= l;
    }

    lenSqr() {
        return this.x*this.x + this.y*this.y + this.z*this.z;
    }

    len() {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }

    distSqr(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        let dz = other.z - this.z;

        return dx*dx + dy*dy + dz*dz;
    }

    dist(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        let dz = other.z - this.z;

        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    asVec2() {
        return new Vec2(this.x, this.y);
    }

    static delta(v0, v1) {
        return new Vec3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
    }
}


export function shuffle(arr) {
    for (let i = 0; i < arr.length; ++i) {
        let j = Math.floor(Math.random() * arr.length);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}


export function lerp(a, b, t) {
    return a * (1.0 - t) + b * t;
}


export function lerpColor(a, b, amount) {
        const ar = a >> 16;
        const ag = a >> 8 & 0xff;
        const ab = a & 0xff;

        const br = b >> 16;
        const bg = b >> 8 & 0xff;
        const bb = b & 0xff;

        const rr = ar + amount * (br - ar);
        const rg = ag + amount * (bg - ag);
        const rb = ab + amount * (bb - ab);

        return (rr << 16) + (rg << 8) + (rb | 0);
}

export function hexToCol(hex) {
    const s = hex.toString(16);
    const p = "0".repeat(6 - s.length);
    return "#" + p + s;
}

export { Vec2, Vec3 };

// Minimal 3D math. No dependencies, no allocation-heavy abstractions — just enough
// to place anchors on a head and rotate it.

export type Vec3 = [number, number, number];

/** Row-major 3x3: [m00, m01, m02, m10, m11, m12, m20, m21, m22]. */
export type Mat3 = [number, number, number, number, number, number, number, number, number];

/** Canvas-style affine: x' = a*x + c*y + e, y' = b*x + d*y + f. */
export type Mat2x3 = [number, number, number, number, number, number];

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale3 = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const len3 = (a: Vec3): number => Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);

export function normalize(a: Vec3): Vec3 {
  const l = len3(a);
  return l > 1e-12 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 1];
}

/** Apply a row-major matrix to a vector. */
export function mul3(m: Mat3, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

export function matMul(a: Mat3, b: Mat3): Mat3 {
  const out = new Array(9) as Mat3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
    }
  }
  return out;
}

export const rotY = (t: number): Mat3 => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
};

export const rotX = (t: number): Mat3 => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [1, 0, 0, 0, c, -s, 0, s, c];
};

export const rotZ = (t: number): Mat3 => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};

/**
 * Head rotation: yaw first (in head space), then pitch, then roll (on screen).
 * R = Rz(roll) . Rx(pitch) . Ry(yaw)
 */
export const headRotation = (yaw: number, pitch: number, roll: number): Mat3 =>
  matMul(rotZ(roll), matMul(rotX(pitch), rotY(yaw)));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function lerpMat2x3(a: Mat2x3, b: Mat2x3, t: number): Mat2x3 {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
    lerp(a[3], b[3], t),
    lerp(a[4], b[4], t),
    lerp(a[5], b[5], t),
  ];
}

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

/** Smooth 0..1 ramp. Works when edge0 > edge1 (ramp reverses). */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Gaussian bump centred on `c` with spread `s`. Used everywhere in head profiles. */
export const bump = (v: number, c: number, s: number): number => Math.exp(-((v - c) * (v - c)) / (2 * s * s));

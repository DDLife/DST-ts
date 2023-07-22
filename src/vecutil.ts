const sqrt = Math.sqrt;

function VecUtil_Add(
  p1_x: number,
  p1_z: number,
  p2_x: number,
  p2_z: number
): [number, number] {
  return [p1_x + p2_x, p1_z + p2_z];
}

function VecUtil_Sub(
  p1_x: number,
  p1_z: number,
  p2_x: number,
  p2_z: number
): [number, number] {
  return [p1_x - p2_x, p1_z - p2_z];
}

function VecUtil_Scale(
  p1_x: number,
  p1_z: number,
  scale: number
): [number, number] {
  return [p1_x * scale, p1_z * scale];
}

function VecUtil_LengthSq(p1_x: number, p1_z: number): number {
  return p1_x * p1_x + p1_z * p1_z;
}

function VecUtil_Length(p1_x: number, p1_z: number): number {
  return sqrt(p1_x * p1_x + p1_z * p1_z);
}

function VecUtil_DistSq(
  p1_x: number,
  p1_z: number,
  p2_x: number,
  p2_z: number
): number {
  return (p1_x - p2_x) * (p1_x - p2_x) + (p1_z - p2_z) * (p1_z - p2_z);
}

function VecUtil_Dist(
  p1_x: number,
  p1_z: number,
  p2_x: number,
  p2_z: number
): number {
  return sqrt((p1_x - p2_x) * (p1_x - p2_x) + (p1_z - p2_z) * (p1_z - p2_z));
}

function VecUtil_Dot(
  p1_x: number,
  p1_z: number,
  p2_x: number,
  p2_z: number
): number {
  return p1_x * p2_x + p1_z * p2_z;
}

function VecUtil_Lerp(
  p1_x: number,
  p1_z: number,
  p2_x: number,
  p2_z: number,
  percent: number
): [number, number] {
  return [(p2_x - p1_x) * percent + p1_x, (p2_z - p1_z) * percent + p1_z];
}

function VecUtil_NormalizeNoNaN(p1_x: number, p1_z: number): [number, number] {
  if (p1_x === 0 && p1_z === 0) {
    return [0, 0];
  }
  const x_sq = p1_x * p1_x;
  const z_sq = p1_z * p1_z;
  const length = sqrt(x_sq + z_sq);
  return [p1_x / length, p1_z / length];
}

function VecUtil_Normalize(p1_x: number, p1_z: number): [number, number] {
  const x_sq = p1_x * p1_x;
  const z_sq = p1_z * p1_z;
  const length = sqrt(x_sq + z_sq);
  return [p1_x / length, p1_z / length];
}

function VecUtil_NormalAndLength(
  p1_x: number,
  p1_z: number
): [number, number, number] {
  const x_sq = p1_x * p1_x;
  const z_sq = p1_z * p1_z;
  const length = sqrt(x_sq + z_sq);
  return [p1_x / length, p1_z / length, length];
}

const RADIANS = 180 / Math.PI;
const PI = Math.PI;

function VecUtil_GetAngleInDegrees(p1_x: number, p1_z: number): number {
  let angle = Math.atan2(p1_z, p1_x) * RADIANS;
  if (angle < 0) {
    angle = 360 + angle;
  }
  return angle;
}

function VecUtil_GetAngleInRads(p1_x: number, p1_z: number): number {
  let angle = Math.atan2(p1_z, p1_x);
  if (angle < 0) {
    angle = PI + PI + angle;
  }
  return angle;
}

function VecUtil_Slerp(
  p1_x: number,
  p1_z: number,
  p2_x: number,
  p2_z: number,
  percent: number
): [number, number] {
  let p1_angle = VecUtil_GetAngleInRads(p1_x, p1_z);
  let p2_angle = VecUtil_GetAngleInRads(p2_x, p2_z);

  if (Math.abs(p2_angle - p1_angle) > PI) {
    if (p2_angle > p1_angle) {
      p2_angle = p2_angle - PI - PI;
    } else {
      p1_angle = p1_angle - PI - PI;
    }
  }

  const lerped_angle = Lerp(p1_angle, p2_angle, percent);

  const cos_lerped_angle = Math.cos(lerped_angle);
  const sin_lerped_angle = Math.sin(lerped_angle);

  return [cos_lerped_angle, sin_lerped_angle];
}

function VecUtil_RotateAroundPoint(
  a_x: number,
  a_z: number,
  b_x: number,
  b_z: number,
  theta: number
): [number, number] {
  const dir_x = b_x - a_x;
  const dir_z = b_z - a_z;
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  return [a_x + dir_x * ct - dir_z * st, a_z + dir_x * st + dir_z * ct];
}

function VecUtil_RotateDir(
  dir_x: number,
  dir_z: number,
  theta: number
): [number, number] {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  return [dir_x * ct - dir_z * st, dir_x * st + dir_z * ct];
}

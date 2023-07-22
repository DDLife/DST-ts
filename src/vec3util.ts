function Vec3Util_Add(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): [number, number, number] {
  return [p1_x + p2_x, p1_y + p2_y, p1_z + p2_z];
}

function Vec3Util_Sub(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): [number, number, number] {
  return [p1_x - p2_x, p1_y - p2_y, p1_z - p2_z];
}

function Vec3Util_Scale(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  scale: number
): [number, number, number] {
  return [p1_x * scale, p1_y * scale, p1_z * scale];
}

function Vec3Util_LengthSq(p1_x: number, p1_y: number, p1_z: number): number {
  return p1_x * p1_x + p1_y * p1_y + p1_z * p1_z;
}

function Vec3Util_Length(p1_x: number, p1_y: number, p1_z: number): number {
  return Math.sqrt(p1_x * p1_x + p1_y * p1_y + p1_z * p1_z);
}

function Vec3Util_DistSq(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): number {
  return (
    (p1_x - p2_x) * (p1_x - p2_x) +
    (p1_y - p2_y) * (p1_y - p2_y) +
    (p1_z - p2_z) * (p1_z - p2_z)
  );
}

function Vec3Util_Dist(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): number {
  return Math.sqrt(
    (p1_x - p2_x) * (p1_x - p2_x) +
      (p1_y - p2_y) * (p1_y - p2_y) +
      (p1_z - p2_z) * (p1_z - p2_z)
  );
}

function Vec3Util_Dot(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): number {
  return p1_x * p2_x + p1_y * p2_y + p1_z * p2_z;
}

function Vec3Util_Lerp(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number,
  percent: number
): [number, number, number] {
  return [
    (p2_x - p1_x) * percent + p1_x,
    (p2_y - p1_y) * percent + p1_y,
    (p2_z - p1_z) * percent + p1_z,
  ];
}

function Vec3Util_Normalize(
  p1_x: number,
  p1_y: number,
  p1_z: number
): [number, number, number] {
  const length = Math.sqrt(p1_x * p1_x + p1_y * p1_y + p1_z * p1_z);
  return [p1_x / length, p1_y / length, p1_z / length];
}

function Vec3Util_NormalAndLength(
  p1_x: number,
  p1_y: number,
  p1_z: number
): [number, number, number, number] {
  const length = Math.sqrt(p1_x * p1_x + p1_y * p1_y + p1_z * p1_z);
  return [p1_x / length, p1_y / length, p1_z / length, length];
}

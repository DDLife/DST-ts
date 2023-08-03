/**
 * This file contains utility functions for working with 3D vectors.
 *
 * @packageDocumentation
 */

/**
 * Adds two 3D vectors together.
 * @param p1_x The x component of the first vector.
 * @param p1_y The y component of the first vector.
 * @param p1_z The z component of the first vector.
 * @param p2_x The x component of the second vector.
 * @param p2_y The y component of the second vector.
 * @param p2_z The z component of the second vector.
 * @returns The resulting vector as an array of three numbers.
 */
export function Vec3Util_Add(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): [number, number, number] {
  return [p1_x + p2_x, p1_y + p2_y, p1_z + p2_z];
}

/**
 * Subtracts one 3D vector from another.
 * @param p1_x The x component of the first vector.
 * @param p1_y The y component of the first vector.
 * @param p1_z The z component of the first vector.
 * @param p2_x The x component of the second vector.
 * @param p2_y The y component of the second vector.
 * @param p2_z The z component of the second vector.
 * @returns The resulting vector as an array of three numbers.
 */
export function Vec3Util_Sub(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): [number, number, number] {
  return [p1_x - p2_x, p1_y - p2_y, p1_z - p2_z];
}

/**
 * Scales a 3D vector by a given factor.
 * @param p1_x The x component of the vector.
 * @param p1_y The y component of the vector.
 * @param p1_z The z component of the vector.
 * @param scale The scaling factor.
 * @returns The resulting vector as an array of three numbers.
 */
export function Vec3Util_Scale(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  scale: number
): [number, number, number] {
  return [p1_x * scale, p1_y * scale, p1_z * scale];
}

/**
 * Calculates the squared length of a 3D vector.
 * @param p1_x The x component of the vector.
 * @param p1_y The y component of the vector.
 * @param p1_z The z component of the vector.
 * @returns The squared length of the vector.
 */
export function Vec3Util_LengthSq(
  p1_x: number,
  p1_y: number,
  p1_z: number
): number {
  return p1_x * p1_x + p1_y * p1_y + p1_z * p1_z;
}

/**
 * Calculates the length of a 3D vector.
 * @param p1_x The x component of the vector.
 * @param p1_y The y component of the vector.
 * @param p1_z The z component of the vector.
 * @returns The length of the vector.
 */
export function Vec3Util_Length(
  p1_x: number,
  p1_y: number,
  p1_z: number
): number {
  return Math.sqrt(p1_x * p1_x + p1_y * p1_y + p1_z * p1_z);
}

/**
 * Calculates the squared distance between two 3D points.
 * @param p1_x The x component of the first point.
 * @param p1_y The y component of the first point.
 * @param p1_z The z component of the first point.
 * @param p2_x The x component of the second point.
 * @param p2_y The y component of the second point.
 * @param p2_z The z component of the second point.
 * @returns The squared distance between the two points.
 */
export function Vec3Util_DistSq(
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

/**
 * Calculates the distance between two 3D points.
 * @param p1_x The x component of the first point.
 * @param p1_y The y component of the first point.
 * @param p1_z The z component of the first point.
 * @param p2_x The x component of the second point.
 * @param p2_y The y component of the second point.
 * @param p2_z The z component of the second point.
 * @returns The distance between the two points.
 */
export function Vec3Util_Dist(
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

/**
 * Calculates the dot product of two 3D vectors.
 * @param p1_x The x component of the first vector.
 * @param p1_y The y component of the first vector.
 * @param p1_z The z component of the first vector.
 * @param p2_x The x component of the second vector.
 * @param p2_y The y component of the second vector.
 * @param p2_z The z component of the second vector.
 * @returns The dot product of the two vectors.
 */
export function Vec3Util_Dot(
  p1_x: number,
  p1_y: number,
  p1_z: number,
  p2_x: number,
  p2_y: number,
  p2_z: number
): number {
  return p1_x * p2_x + p1_y * p2_y + p1_z * p2_z;
}

/**
 * Linearly interpolates between two 3D points.
 * @param p1_x The x component of the first point.
 * @param p1_y The y component of the first point.
 * @param p1_z The z component of the first point.
 * @param p2_x The x component of the second point.
 * @param p2_y The y component of the second point.
 * @param p2_z The z component of the second point.
 * @param percent The interpolation factor.
 * @returns The interpolated point as an array of three numbers.
 */
export function Vec3Util_Lerp(
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

/**
 * Normalizes a 3D vector.
 * @param p1_x The x component of the vector.
 * @param p1_y The y component of the vector.
 * @param p1_z The z component of the vector.
 * @returns The normalized vector as an array of three numbers.
 */
export function Vec3Util_Normalize(
  p1_x: number,
  p1_y: number,
  p1_z: number
): [number, number, number] {
  const length = Math.sqrt(p1_x * p1_x + p1_y * p1_y + p1_z * p1_z);
  return [p1_x / length, p1_y / length, p1_z / length];
}

/**
 * Normalizes a 3D vector and returns its length.
 * @param p1_x The x component of the vector.
 * @param p1_y The y component of the vector.
 * @param p1_z The z component of the vector.
 * @returns The normalized vector as an array of three numbers and its length as a number.
 */
export function Vec3Util_NormalAndLength(
  p1_x: number,
  p1_y: number,
  p1_z: number
): [number, number, number, number] {
  const length = Math.sqrt(p1_x * p1_x + p1_y * p1_y + p1_z * p1_z);
  return [p1_x / length, p1_y / length, p1_z / length, length];
}

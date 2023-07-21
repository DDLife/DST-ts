/**
 * Represents a 3D vector with x, y, and z components.
 */
export class Vector3 {
  /**
   * The x component of the vector.
   */
  x: number;
  /**
   * The y component of the vector.
   */
  y: number;
  /**
   * The z component of the vector.
   */
  z: number;

  /**
   * Creates a new Vector3 instance.
   * @param x - The x component of the vector. Default is 0.
   * @param y - The y component of the vector. Default is 0.
   * @param z - The z component of the vector. Default is 0.
   */
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Adds the given vector to this vector and returns the result as a new Vector3 instance.
   * @param rhs - The vector to add.
   * @returns A new Vector3 instance representing the sum of this vector and the given vector.
   */
  add(rhs: Vector3): Vector3 {
    return new Vector3(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z);
  }

  /**
   * Subtracts the given vector from this vector and returns the result as a new Vector3 instance.
   * @param rhs - The vector to subtract.
   * @returns A new Vector3 instance representing the difference between this vector and the given vector.
   */
  sub(rhs: Vector3): Vector3 {
    return new Vector3(this.x - rhs.x, this.y - rhs.y, this.z - rhs.z);
  }

  /**
   * Multiplies this vector by the given scalar and returns the result as a new Vector3 instance.
   * @param rhs - The scalar to multiply by.
   * @returns A new Vector3 instance representing the product of this vector and the given scalar.
   */
  mul(rhs: number): Vector3 {
    return new Vector3(this.x * rhs, this.y * rhs, this.z * rhs);
  }

  /**
   * Divides this vector by the given scalar and returns the result as a new Vector3 instance.
   * @param rhs - The scalar to divide by.
   * @returns A new Vector3 instance representing the quotient of this vector and the given scalar.
   */
  div(rhs: number): Vector3 {
    return new Vector3(this.x / rhs, this.y / rhs, this.z / rhs);
  }

  /**
   * Returns the negation of this vector as a new Vector3 instance.
   * @returns A new Vector3 instance representing the negation of this vector.
   */
  neg(): Vector3 {
    return new Vector3(-this.x, -this.y, -this.z);
  }

  /**
   * Returns the dot product of this vector and the given vector.
   * @param rhs - The vector to compute the dot product with.
   * @returns The dot product of this vector and the given vector.
   */
  dot(rhs: Vector3): number {
    return this.x * rhs.x + this.y * rhs.y + this.z * rhs.z;
  }

  /**
   * Returns the cross product of this vector and the given vector as a new Vector3 instance.
   * @param rhs - The vector to compute the cross product with.
   * @returns A new Vector3 instance representing the cross product of this vector and the given vector.
   */
  cross(rhs: Vector3): Vector3 {
    return new Vector3(
      this.y * rhs.z - this.z * rhs.y,
      this.z * rhs.x - this.x * rhs.z,
      this.x * rhs.y - this.y * rhs.x
    );
  }

  /**
   * Returns a string representation of this vector.
   * @returns A string representation of this vector.
   */
  toString(): string {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  }

  /**
   * Returns true if this vector is equal to the given vector, false otherwise.
   * @param rhs - The vector to compare with.
   * @returns True if this vector is equal to the given vector, false otherwise.
   */
  equals(rhs: Vector3): boolean {
    return this.x === rhs.x && this.y === rhs.y && this.z === rhs.z;
  }

  /**
   * Returns the squared distance between this vector and the given vector.
   * @param other - The vector to compute the distance to.
   * @returns The squared distance between this vector and the given vector.
   */
  distSq(other: Vector3): number {
    return (
      (this.x - other.x) ** 2 +
      (this.y - other.y) ** 2 +
      (this.z - other.z) ** 2
    );
  }

  /**
   * Returns the distance between this vector and the given vector.
   * @param other - The vector to compute the distance to.
   * @returns The distance between this vector and the given vector.
   */
  dist(other: Vector3): number {
    return Math.sqrt(this.distSq(other));
  }

  /**
   * Returns the squared length of this vector.
   * @returns The squared length of this vector.
   */
  lengthSq(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }

  /**
   * Returns the length of this vector.
   * @returns The length of this vector.
   */
  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  /**
   * Normalizes this vector and returns it.
   * @returns This vector, after normalization.
   */
  normalize(): Vector3 {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
      this.z /= len;
    }
    return this;
  }

  /**
   * Returns a new normalized Vector3 instance representing this vector.
   * @returns A new normalized Vector3 instance representing this vector.
   */
  getNormalized(): Vector3 {
    return this.divideScalar(this.length());
  }

  /**
   * Returns a tuple containing a new normalized Vector3 instance representing this vector and its length.
   * @returns A tuple containing a new normalized Vector3 instance representing this vector and its length.
   */
  getNormalizedAndLength(): [Vector3, number] {
    const len = this.length();
    return [len > 0 ? this.divideScalar(len) : this, len];
  }

  /**
   * Returns an array containing the x, y, and z components of this vector.
   * @returns An array containing the x, y, and z components of this vector.
   */
  get(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  /**
   * Returns true if this object is an instance of Vector3, false otherwise.
   * @returns True if this object is an instance of Vector3, false otherwise.
   */
  isVector3(): boolean {
    return true;
  }

  /**
   * Returns a new Vector3 instance with the given polar coordinates.
   * @param theta - The angle in radians.
   * @param radius - The radius. Default is 1.
   * @returns A new Vector3 instance with the given polar coordinates.
   */
  static fromTheta(theta: number, radius = 1): Vector3 {
    return new Vector3(radius * Math.cos(theta), 0, -radius * Math.sin(theta));
  }

  /**
   * Divides this vector by the given scalar and returns the result as a new Vector3 instance.
   * @param scalar - The scalar to divide by.
   * @returns A new Vector3 instance representing the quotient of this vector and the given scalar.
   * @private
   */
  private divideScalar(scalar: number): Vector3 {
    return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
  }
}

/**
 * Converts the given object to a Vector3 instance.
 * @param obj - The object to convert.
 * @param y - The y component of the vector. Default is 0.
 * @param z - The z component of the vector. Default is 0.
 * @returns A new Vector3 instance representing the given object.
 */
export function toVector3(
  obj: any,
  y?: number,
  z?: number
): Vector3 | undefined {
  if (!obj) {
    return undefined;
  }
  if (obj instanceof Vector3) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return new Vector3(+obj[0], +obj[1], +obj[2]);
  } else {
    return new Vector3(+obj, +(y ?? 0), +(z ?? 0));
  }
}

/**
 * Returns a new Vector3 instance with the given polar coordinates.
 * @param theta - The angle in radians.
 * @param radius - The radius. Default is 1.
 * @returns A new Vector3 instance with the given polar coordinates.
 */
export function vector3FromTheta(theta: number, radius = 1): Vector3 {
  return new Vector3(radius * Math.cos(theta), 0, -radius * Math.sin(theta));
}

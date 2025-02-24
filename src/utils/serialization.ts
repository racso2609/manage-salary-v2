// @ts-expect-error this property doesnt exist in vanilla
BigInt.prototype.toJSON = function () {
  return this.toString();
};

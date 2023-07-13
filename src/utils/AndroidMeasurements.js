// This module is used both at build time and at runtime
// so it should remain in JS language and CommonJS module

/** @param {number} value */
module.exports.dp2px = value => value * 0.6

/** @param {number} value */
module.exports.sp2rem = value => value * 0.0375 // assume 1rem = 16px

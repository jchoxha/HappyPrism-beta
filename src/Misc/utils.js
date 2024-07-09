function nearestMultiple(x, multiple) {
    return Math.round(x / multiple) * multiple;
  }

  module.exports = { nearestMultiple };
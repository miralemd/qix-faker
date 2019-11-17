const generate = require('./hc');

const hypercube = ({ dimensions, measures, numRows, seed }) => {
  const hc = generate({
    dimensions,
    measures,
    numRows,
    seed,
  });

  return hc;
};

const listobject = ({ dimension, numRows, seed }) => {
  const hc = generate({
    numRows,
    seed,
    dimensions: [dimension],
  });

  return {
    qDimensionInfo: hc.qDimensionInfo[0],
    qDataPages: hc.qDataPages,
    qSize: hc.qSize,
  };
};

module.exports = {
  hypercube,
  listobject,
};

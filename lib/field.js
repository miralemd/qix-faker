const dimension = require('./dimension');
const measure = require('./measure');

const field = ({ f, index, isMeasure, numRows, faker, isAttr = false, forceUnique = false }) => {
  let value = () => '';
  let fake = f;
  let maxCardinalRatio = 1;

  let attrDims = [];
  let attrExps = [];

  let override = {};

  if (typeof f === 'object') {
    fake = f.value;
    override = f.override ? { ...f.override } : override;
    maxCardinalRatio = typeof f.maxCardinalRatio !== 'undefined' ? f.maxCardinalRatio : maxCardinalRatio;

    if (f.attrDims && !isAttr) {
      attrDims = f.attrDims.map((af, ai) => field({ f: af, index: ai, numRows, faker, isAttr: true }));
    }
    if (f.attrExps && !isAttr) {
      attrExps = f.attrExps.map((af, ai) => field({ f: af, index: ai, isMeasure: true, numRows, faker, isAttr: true }));
    }
  }

  if (typeof fake === 'string') {
    value = () => fake;
  } else if (typeof fake === 'function') {
    value = fake.bind(null, faker);
  }

  if (isMeasure) {
    return measure({
      value,
      numRows,
      index,
      isAttr,
      attrDims,
      attrExps,
      override,
    });
  }
  return dimension({
    value,
    numRows,
    index,
    isAttr,
    attrDims,
    attrExps,
    maxCardinalRatio,
    forceUnique,
    override,
  });
};

module.exports = field;

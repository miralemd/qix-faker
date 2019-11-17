const INITIAL_NON_DIGITS = /^[^0-9-]*/;

const numeric = () => {
  const validValues = [];
  return {
    num(str) {
      const vNum = parseFloat(str.replace(INITIAL_NON_DIGITS, ''));
      let ret = 'NaN';
      if (typeof vNum === 'number' && !Number.isNaN(vNum)) {
        validValues.push(vNum);
        ret = vNum;
      }
      return ret;
    },
    min() {
      return validValues.length ? Math.min(...validValues) : 'NaN';
    },
    max() {
      return validValues.length ? Math.max(...validValues) : 'NaN';
    },
  };
};

module.exports = numeric;

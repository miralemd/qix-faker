const faker = require('faker/locale/en');
const field = require('./field');

const generate = ({ dimensions = [], measures = [], numRows = 50, seed = new Date().getTime() % 1000000000 } = {}) => {
  faker.seed(seed);

  const nRows = dimensions.length + measures.length > 0 ? Math.min(numRows, generate.MAX_ROWS) : 0;

  const dims = dimensions.map((f, i) => field({ f, index: i, numRows: nRows, faker }));
  const meas = measures.map((f, i) => field({ f, index: i, isMeasure: true, numRows: nRows, faker }));

  const fields = [...dims, ...meas];

  const numFields = fields.length;
  const rows = Array(nRows);

  for (let r = 0; r < nRows; r++) {
    const row = Array(numFields);
    for (let c = 0; c < numFields; c++) {
      row[c] = fields[c].cell(r);
    }
    rows[r] = row;
  }

  const page = {
    qArea: {
      qLeft: 0,
      qTop: 0,
      qWidth: numFields,
      qHeight: nRows,
    },
    qMatrix: rows,
    qTails: [{ qUp: 0, qDown: 0 }],
  };

  const hc = {
    qDimensionInfo: dims.map(d => d.info()),
    qMeasureInfo: meas.map(m => m.info()),
    qMode: 'S',
    qDataPages: [page],
    qSize: {
      qcy: nRows,
      qcx: fields.length,
    },
    qEffectiveInterColumnSortOrder: [...dims.map((a, i) => i), ...meas.map((f, i) => dims.length + i)],
  };

  return hc;
};

generate.MAX_ROWS = 10000;

module.exports = generate;

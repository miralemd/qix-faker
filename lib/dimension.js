const nxCell = require('./cell');
const numeric = require('./numeric');

const dimension = ({
  value,
  index,
  numRows,
  maxCardinalRatio = 1,
  override = {},
  isAttr = false,
  attrDims = [],
  attrExps = [],
}) => {
  const unique = Object.create(null);
  let numUnique = 0;

  const repness = 1 / Math.max(0, Math.min(1, maxCardinalRatio));

  let prevCell;
  let prevRep;

  let glyphCount = 0;
  const num = numeric();

  const basicCell = rowIndex => {
    const rep = Math.floor(rowIndex / repness);
    if (prevCell && rep === prevRep) {
      return prevCell;
    }
    const v = `${value(rowIndex)}`;
    if (typeof unique[v] === 'undefined') {
      // TODO - check if date and convert to qlik date

      unique[v] = isAttr
        ? {
            qElemNo: numUnique++,
            qText: v,
          }
        : {
            qElemNumber: numUnique++,
            qText: v,
            qNum: num.num(v),
          };
      prevCell = unique[v];

      glyphCount = Math.max(glyphCount, unique[v].qText.length);
    }
    prevRep = rep;

    return unique[v];
  };

  const info = () => {
    return {
      qCardinal: numUnique,
      qFallbackTitle: `${isAttr ? 'Attr' : ''}Dimension ${index}`,
      ...(isAttr
        ? {
            qSize: { qcy: numRows, qcx: 2 },
          }
        : {
            qMin: num.min(),
            qMax: num.max(),
            qAttrDimInfo: attrDims.map(ad => ad.info()),
            qAttrExprInfo: attrExps.map(ad => ad.info()),
            qApprMaxGlyphCount: glyphCount,
            qStateCounts: {},
          }),
      ...override,
    };
  };

  const cell = !isAttr && (attrDims.length || attrExps.length) ? nxCell(basicCell, attrDims, attrExps) : basicCell;

  return {
    cell,
    info,
  };
};

module.exports = dimension;

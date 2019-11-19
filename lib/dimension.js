const nxCell = require('./cell');
const numeric = require('./numeric');

const UNCLOCKED_STATES = ['S', 'O', 'D', 'A', 'X', 'XS'];
const STATES = ['L', 'S', 'O', 'D', 'A', 'X', 'XS', 'XL'];

const COUNTS = {
  L: 'qLocked',
  S: 'qSelected',
  O: 'qOption',
  D: 'qDeselected',
  A: 'qAlternative',
  X: 'qExcluded',
  XS: 'qSelectedExcluded',
  XL: 'qLockedExcluded',
};

const dimension = ({
  value,
  index,
  numRows,
  faker,
  maxCardinalRatio = 1,
  override = {},
  isAttr = false,
  attrDims = [],
  attrExps = [],
  forceUnique = false,
}) => {
  const unique = Object.create(null);
  let numUnique = 0;

  const repness = forceUnique ? 1 : 1 / Math.max(0, Math.min(1, maxCardinalRatio));

  let prevCell;
  let prevRep;

  let glyphCount = 0;
  const num = numeric();

  const qStateCounts = {};
  Object.keys(COUNTS).forEach(key => (qStateCounts[COUNTS[key]] = 0));
  const states = override.qLocked ? STATES : UNCLOCKED_STATES;

  const getUnique = rowIndex => {
    let v;
    for (let k = 0; k < 50; k++) {
      v = `${value(rowIndex)}`;
      if (typeof unique[v] === 'undefined') {
        return v;
      }
    }
    return v;
  };

  const basicCell = rowIndex => {
    const rep = Math.floor(rowIndex / repness);
    if (prevCell && rep === prevRep) {
      return prevCell;
    }
    const v = forceUnique ? getUnique(rowIndex) : `${value(rowIndex)}`;

    if (typeof unique[v] === 'undefined') {
      // TODO - check if date and convert to qlik date

      let state;

      unique[v] = isAttr
        ? {
            qElemNo: numUnique++,
            qText: v,
          }
        : {
            qElemNumber: numUnique++,
            qText: v,
            qNum: num.num(v),
            qState: (qStateCounts[COUNTS[(state = faker.random.arrayElement(states))]]++, state),
          };
      prevCell = unique[v];

      glyphCount = Math.max(glyphCount, unique[v].qText.length);
    } else if (forceUnique) {
      return false;
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
            qStateCounts,
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

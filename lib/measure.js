const nxCell = require('./cell');
const numeric = require('./numeric');

const measure = ({ value, index, override = {}, attrDims = [], attrExps = [], isAttr = false }) => {
  const num = numeric();
  const basicCell = rowIndex => {
    const v = `${value(rowIndex)}`;
    return isAttr
      ? {
          qText: v,
          qNum: num.num(v),
        }
      : {
          qElemNumber: index,
          qText: v,
          qNum: num.num(v),
        };
  };

  const info = () => {
    return {
      qMin: num.min(),
      qMax: num.max(),
      qFallbackTitle: `${isAttr ? 'Attr' : ''}Measure ${index}`,
      ...(isAttr
        ? {}
        : {
            qAttrDimInfo: attrDims.map(ad => ad.info()),
            qAttrExprInfo: attrExps.map(ad => ad.info()),
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

module.exports = measure;

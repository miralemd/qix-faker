const nxCell = (basicCell, attrDims, attrExps) => rowIndex => {
  const c = basicCell(rowIndex);

  const qAttrDims = { qValues: [] };
  const qAttrExps = { qValues: [] };

  if (attrDims.length) {
    const qValues = Array(attrDims.length);
    for (let c = 0; c < qValues.length; c++) {
      qValues[c] = attrDims[c].cell(rowIndex);
    }

    qAttrDims.qValues = qValues;
  }
  if (attrExps.length) {
    const qValues = Array(attrExps.length);
    for (let c = 0; c < qValues.length; c++) {
      qValues[c] = attrExps[c].cell(rowIndex);
    }

    qAttrExps.qValues = qValues;
  }

  return {
    ...c,
    qAttrDims,
    qAttrExps,
  };
};

module.exports = nxCell;

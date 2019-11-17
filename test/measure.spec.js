const measure = require('../lib/measure');

describe('measure', () => {
  it('should provide value() with row index', () => {
    const d = measure({
      index: 0,
      value: idx => `a:${idx}`,
    });

    expect(d.cell(3)).to.eql({
      qElemNumber: 0,
      qText: 'a:3',
      qNum: 3,
    });
  });

  it('should use index as qElemNumber', () => {
    const d = measure({
      index: 3,
      value: () => '',
    });

    expect(d.cell(2).qElemNumber).to.eql(3);
    expect(d.cell(3).qElemNumber).to.eql(3);
  });

  it('should create attrExps', () => {
    const am = measure({
      isAttr: true,
      index: 1,
      value: idx => `am${idx * 3}`,
    });
    const d = measure({
      index: 3,
      value: idx => `${idx}`,
      attrExps: [am],
    });

    expect(d.cell(2).qAttrExps).to.eql({
      qValues: [{ qNum: 6, qText: 'am6' }],
    });
  });

  it('should create attrDims', () => {
    const ad = {
      cell: idx => ({ qText: `ad${idx * 3}` }),
    };
    const d = measure({
      index: 3,
      value: idx => `${idx}`,
      attrDims: [ad],
    });

    expect(d.cell(2).qAttrDims).to.eql({
      qValues: [{ qText: 'ad6' }],
    });
  });

  it('should return info', () => {
    const d = measure({
      index: 2,
      value: idx => `$${idx}`,
      override: {
        qFallbackTitle: 'meh',
      },
      attrDims: [{ cell: () => 7, info: () => 'info' }],
      attrExps: [
        measure({
          index: 4,
          value: idx => `${idx * 2}`,
          isAttr: true,
        }),
      ],
    });

    d.cell(30);
    d.cell(15);
    d.cell(17);

    expect(d.info()).to.eql({
      qMin: 15,
      qMax: 30,
      qFallbackTitle: 'meh',
      qAttrDimInfo: ['info'],
      qAttrExprInfo: [
        {
          qFallbackTitle: 'AttrMeasure 4',
          qMax: 60,
          qMin: 30,
        },
      ],
    });
  });
});

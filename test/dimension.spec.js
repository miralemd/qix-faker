const dimension = require('../lib/dimension');

describe('dimension', () => {
  it('should provide value() with row index', () => {
    const d = dimension({
      value: idx => `a:${idx}`,
    });

    expect(d.cell(3)).to.eql({
      qElemNumber: 0,
      qText: 'a:3',
      qNum: 3,
    });
  });

  it('should track unique values', () => {
    const d = dimension({
      value: idx => `a-${idx}`,
    });

    d.cell(2);
    d.cell(2);

    expect(d.cell(2).qElemNumber).to.eql(0);
    expect(d.cell(3).qElemNumber).to.eql(1);
  });

  it('should create attrDims', () => {
    const ad = dimension({
      value: idx => `a:${idx * 5}`,
      isAttr: true,
    });
    const d = dimension({
      value: idx => `d:${idx * 3}`,
      attrDims: [ad],
    });

    expect(d.cell(2)).to.eql({
      qElemNumber: 0,
      qText: 'd:6',
      qNum: 6,
      qAttrDims: {
        qValues: [{ qElemNo: 0, qText: 'a:10' }],
      },
      qAttrExps: { qValues: [] },
    });
  });

  it('should create attrExps', () => {
    const ae = { cell: idx => ({ qText: `$${idx}` }) };
    const d = dimension({
      value: idx => `d:${idx * 3}`,
      attrExps: [ae],
    });

    expect(d.cell(2)).to.eql({
      qElemNumber: 0,
      qText: 'd:6',
      qNum: 6,
      qAttrExps: {
        qValues: [{ qText: '$2' }],
      },
      qAttrDims: { qValues: [] },
    });
  });

  it.skip('should convert date to qlik date', () => {
    const d = dimension({
      value: () => new Date(2019, 6, 7, 8, 20, 30),
    });

    expect(d.cell()).to.eql();
  });

  it('should limit uniqueness', () => {
    const numRows = 10;
    const maxCardinalRatio = 0.5;
    const d = dimension({
      maxCardinalRatio,
      numRows,
      value: idx => `a-${idx}`,
    });

    const values = [];
    for (let r = 0; r < numRows; r++) {
      values.push(d.cell(r).qText);
    }

    expect(values).to.eql(['a-0', 'a-0', 'a-2', 'a-2', 'a-4', 'a-4', 'a-6', 'a-6', 'a-8', 'a-8']);
  });

  it('should improve uniqueness', () => {
    const numRows = 4;
    const maxCardinalRatio = 0.5;
    const value = sinon.stub();
    value.returns('a');
    value
      .withArgs(1)
      .onCall(9)
      .returns('b');
    const d = dimension({
      maxCardinalRatio,
      numRows,
      forceUnique: true,
      value,
    });

    const values = [];
    for (let r = 0; r < numRows; r++) {
      const v = d.cell(r);
      values.push(v ? v.qText : v);
    }

    expect(values).to.eql(['a', 'b', false, false]);
  });

  it('should return info', () => {
    const d = dimension({
      value: idx => `a-${idx}`,
      override: {
        qFallbackTitle: 'dim',
        qLocked: true,
      },
      attrDims: [
        dimension({
          value: idx => `ad${idx * 3}`,
          index: 7,
          numRows: 5,
          isAttr: true,
        }),
      ],
      attrExps: [
        {
          cell: idx => `$${idx * 2}`,
          info: () => 'info',
        },
      ],
    });

    d.cell(1);
    d.cell(2);
    d.cell(2);

    expect(d.info()).to.eql({
      qApprMaxGlyphCount: 3,
      qCardinal: 2,
      qStateCounts: {},
      qMin: -2,
      qMax: -1,
      qLocked: true,
      qFallbackTitle: 'dim',
      qAttrDimInfo: [
        {
          qCardinal: 2,
          qFallbackTitle: 'AttrDimension 7',
          qSize: { qcx: 2, qcy: 5 },
        },
      ],
      qAttrExprInfo: ['info'],
    });
  });
});

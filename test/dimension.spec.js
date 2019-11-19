const dimension = require('../lib/dimension');

describe('dimension', () => {
  const faker = {
    random: {
      arrayElement: () => 'O',
    },
  };

  it('should provide value() with row index', () => {
    const d = dimension({
      value: idx => `a:${idx}`,
      faker,
    });

    expect(d.cell(3)).to.eql({
      qElemNumber: 0,
      qText: 'a:3',
      qNum: 3,
      qState: 'O',
    });
  });

  it('should track unique values', () => {
    const d = dimension({
      value: idx => `a-${idx}`,
      faker,
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
      faker,
    });

    expect(d.cell(2)).to.eql({
      qElemNumber: 0,
      qText: 'd:6',
      qNum: 6,
      qState: 'O',
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
      faker,
    });

    expect(d.cell(2)).to.eql({
      qElemNumber: 0,
      qText: 'd:6',
      qNum: 6,
      qState: 'O',
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
      faker,
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
      faker,
    });

    const values = [];
    for (let r = 0; r < numRows; r++) {
      const v = d.cell(r);
      values.push(v ? v.qText : v);
    }

    expect(values).to.eql(['a', 'b', false, false]);
  });

  it('should generate all states when qLocked is true', () => {
    const arrayElement = sinon.stub();
    arrayElement.onCall(0).returns('L');
    arrayElement.onCall(1).returns('S');
    arrayElement.onCall(2).returns('O');
    arrayElement.onCall(3).returns('D');
    arrayElement.onCall(4).returns('A');
    arrayElement.onCall(5).returns('X');
    arrayElement.onCall(6).returns('XS');
    arrayElement.onCall(7).returns('XL');
    arrayElement.onCall(8).returns('S');
    arrayElement.onCall(9).returns('D');

    const numRows = 10;

    const d = dimension({
      numRows,
      value: idx => idx,
      faker: {
        random: {
          arrayElement,
        },
      },
      override: {
        qLocked: true,
      },
    });

    const states = [];
    for (let r = 0; r < numRows; r++) {
      states.push(d.cell(r).qState);
    }

    expect(states).to.eql(['L', 'S', 'O', 'D', 'A', 'X', 'XS', 'XL', 'S', 'D']);
    expect(arrayElement.firstCall).to.have.been.calledWithExactly(['L', 'S', 'O', 'D', 'A', 'X', 'XS', 'XL']);

    expect(d.info().qStateCounts).to.eql({
      qAlternative: 1,
      qDeselected: 2,
      qExcluded: 1,
      qLocked: 1,
      qLockedExcluded: 1,
      qOption: 1,
      qSelected: 2,
      qSelectedExcluded: 1,
    });
  });

  it('should not generate locked states when qLocked is falsy', () => {
    const arrayElement = sinon.stub();

    const d = dimension({
      numRows: 1,
      value: idx => idx,
      faker: {
        random: {
          arrayElement,
        },
      },
    });

    d.cell(0);

    expect(arrayElement.firstCall).to.have.been.calledWithExactly(['S', 'O', 'D', 'A', 'X', 'XS']);
  });

  it('should return info', () => {
    const d = dimension({
      value: idx => `a-${idx}`,
      faker,
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
      qStateCounts: {
        qAlternative: 0,
        qDeselected: 0,
        qExcluded: 0,
        qLocked: 0,
        qLockedExcluded: 0,
        qOption: 2,
        qSelected: 0,
        qSelectedExcluded: 0,
      },
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

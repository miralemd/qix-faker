const doMock = ({
  faker = {
    seed: sinon.spy(),
  },
  field,
}) =>
  aw.mock(
    [
      [require.resolve('faker/locale/en'), () => faker],
      ['**/lib/field.js', () => field],
    ],
    ['../lib/hc.js']
  );

describe('hc', () => {
  let faker;
  let field;
  beforeEach(() => {
    faker = {
      seed: sinon.spy(),
    };

    field = sinon.stub();
  });

  it('should generate an empty hc by default', () => {
    const [generate] = doMock({ faker, field });

    const hc = generate();

    expect(hc).to.eql({
      qDataPages: [
        { qArea: { qHeight: 0, qWidth: 0, qTop: 0, qLeft: 0 }, qMatrix: [], qTails: [{ qUp: 0, qDown: 0 }] },
      ],
      qDimensionInfo: [],
      qMeasureInfo: [],
      qMode: 'S',
      qSize: { qcx: 0, qcy: 0 },
      qEffectiveInterColumnSortOrder: [],
    });
  });

  it('should generate a full cube', () => {
    const f = {
      cell: row => `${row}`,
      info: () => 'info',
    };
    field.returns(f);
    const [generate] = doMock({ faker, field });

    const hc = generate({
      numRows: 3,
      dimensions: ['d'],
      measures: ['m'],
    });

    expect(hc).to.eql({
      qDataPages: [
        {
          qArea: { qHeight: 3, qWidth: 2, qTop: 0, qLeft: 0 },
          qMatrix: [
            ['0', '0'],
            ['1', '1'],
            ['2', '2'],
          ],
          qTails: [{ qUp: 0, qDown: 0 }],
        },
      ],
      qDimensionInfo: ['info'],
      qMeasureInfo: ['info'],
      qMode: 'S',
      qSize: { qcx: 2, qcy: 3 },
      qEffectiveInterColumnSortOrder: [0, 1],
    });
  });

  it('should have static MAX_ROWS of 10k', () => {
    const [generate] = doMock({ faker, field });

    expect(generate.MAX_ROWS).to.equal(10000);
  });

  it('should set faker.seed', () => {
    const [generate] = doMock({ faker, field });
    generate();
    expect(faker.seed).to.have.been.calledOnce;
  });

  it('should set custom faker.seed', () => {
    const [generate] = doMock({ faker, field });
    generate({ seed: 123 });
    expect(faker.seed).to.have.been.calledWithExactly(123);
  });

  it('should call field as dimension', () => {
    const dim0 = {
      cell: row => `${row}`,
      info: () => 'info',
    };
    // field.withArgs({ f: 'dim', index: 0, numRows: 3 }).returns(dim0);
    field.returns(dim0);
    const [generate] = doMock({ faker, field });

    const hc = generate({
      numRows: 3,
      dimensions: ['dim'],
      measures: [],
      forceUnique: true,
    });

    expect(field).to.have.been.calledWithExactly({ f: 'dim', index: 0, numRows: 3, faker, forceUnique: true });

    expect(hc.qDimensionInfo[0]).to.equal('info');
    expect(hc.qDataPages[0].qMatrix).to.eql([['0'], ['1'], ['2']]);
  });

  it('should call field as measure', () => {
    const m0 = {
      cell: row => row + 10,
      info: () => 'info',
    };
    field.returns(m0);
    const [generate] = doMock({ faker, field });

    const hc = generate({
      numRows: 3,
      dimensions: [],
      measures: ['m'],
    });

    expect(field).to.have.been.calledWithExactly({ f: 'm', index: 0, numRows: 3, isMeasure: true, faker });
    expect(hc.qMeasureInfo[0]).to.equal('info');
    expect(hc.qDataPages[0].qMatrix).to.eql([[10], [11], [12]]);
  });

  it('should limit num rows', () => {
    const f = {
      cell: row => row + 5,
      info: () => 'info',
    };
    field.returns(f);
    const [generate] = doMock({ faker, field });
    generate.MAX_ROWS = 7;

    const hc = generate({
      numRows: 10,
      dimensions: ['dim'],
    });

    expect(hc.qSize.qcy).to.equal(7);
  });

  it('should limit rows when uniqueness is forced', () => {
    const cell = sinon.stub();
    cell.onCall(0).returns('a');
    cell.onCall(1).returns('b');
    cell.onCall(2).returns(false);
    const f = {
      cell,
      info: () => 'info',
    };
    field.returns(f);
    const [generate] = doMock({ faker, field });

    const hc = generate({
      numRows: 5,
      dimensions: ['dim'],
    });

    expect(hc.qSize.qcy).to.equal(2);
    expect(hc.qDataPages[0].qArea).to.eql({ qTop: 0, qLeft: 0, qWidth: 1, qHeight: 2 });
    expect(hc.qDataPages[0].qMatrix).to.eql([['a'], ['b']]);
  });
});

const doMock = ({ dimension, measure }) =>
  aw.mock(
    [
      ['**/lib/dimension.js', () => dimension],
      ['**/lib/measure.js', () => measure],
    ],
    ['../lib/field.js']
  );

describe('field', () => {
  let dimension;
  let measure;
  beforeEach(() => {
    dimension = sinon.stub();
    measure = sinon.stub();
  });

  it('should create a dimension', () => {
    dimension.returns('dim');
    const [field] = doMock({ dimension, measure });

    const faker = 'faker';
    const f = field({ f: 'a', index: 2, numRows: 13, faker });

    expect(f).to.equal('dim');

    const arg = dimension.getCall(0).args[0];
    delete arg.value;
    expect(arg).to.eql({
      index: 2,
      numRows: 13,
      isAttr: false,
      attrDims: [],
      attrExps: [],
      maxCardinalRatio: 1,
      override: {},
    });
  });

  it('should create a measure', () => {
    measure.returns('mea');
    const [field] = doMock({ dimension, measure });

    const faker = 'faker';
    const f = field({ f: 'a', index: 2, isMeasure: true, numRows: 13, faker });

    expect(f).to.equal('mea');

    const arg = measure.getCall(0).args[0];
    delete arg.value;
    expect(arg).to.eql({
      index: 2,
      numRows: 13,
      isAttr: false,
      attrDims: [],
      attrExps: [],
      override: {},
    });
  });

  it('should handle a string', () => {
    const [field] = doMock({ dimension, measure });

    const faker = 'faker';
    field({ f: 'a', index: 2, numRows: 13, faker });

    const { value } = dimension.getCall(0).args[0];

    expect(value()).to.eql('a');
  });

  it('should handle a function', () => {
    const [field] = doMock({ dimension, measure });

    const faker = { name: () => 'n' };
    const fn = f => f.name();
    field({ f: fn, index: 0, numRows: 0, faker });

    const { value } = dimension.getCall(0).args[0];

    expect(value()).to.eql('n');
  });

  it('should handle an object', () => {
    const [field] = doMock({ dimension, measure });
    const faker = { name: () => 'n' };

    field({
      f: {
        value: 'v',
        maxCardinalRatio: 0.7,
        override: { bla: 'meh' },
      },
      index: 2,
      numRows: 13,
      faker,
    });

    const arg = dimension.getCall(0).args[0];
    delete arg.value;
    expect(arg).to.eql({
      index: 2,
      numRows: 13,
      isAttr: false,
      attrDims: [],
      attrExps: [],
      maxCardinalRatio: 0.7,
      override: { bla: 'meh' },
    });
  });

  it('should handle attrDims', () => {
    const [field] = doMock({ dimension, measure });
    const faker = { name: () => 'n' };

    field({
      f: {
        value: 'v',
        attrDims: ['ad'],
      },
      index: 2,
      numRows: 13,
      faker,
    });

    const arg = dimension.getCall(0).args[0];
    expect(arg.value()).to.equal('ad');
    delete arg.value;
    expect(arg).to.eql({
      index: 0,
      numRows: 13,
      isAttr: true,
      attrDims: [],
      attrExps: [],
      maxCardinalRatio: 1,
      override: {},
    });
  });

  it('should handle attrExps', () => {
    const [field] = doMock({ dimension, measure });
    const faker = { name: () => 'n' };

    field({
      f: {
        value: 'v',
        attrExps: ['ax'],
      },
      index: 2,
      numRows: 13,
      faker,
    });

    const arg = measure.getCall(0).args[0];
    expect(arg.value()).to.equal('ax');
    delete arg.value;
    expect(arg).to.eql({
      index: 0,
      numRows: 13,
      isAttr: true,
      attrDims: [],
      attrExps: [],
      override: {},
    });
  });
});

const doMock = ({ generate }) => aw.mock([['**/lib/hc.js', () => generate]], ['../lib/index.js']);

describe('qix-faker', () => {
  let generate;
  beforeEach(() => {
    generate = sinon.stub();
  });

  it('should return hypercube', () => {
    const [qix] = doMock({ generate });

    generate.returns('hc');

    const hc = qix.hypercube({
      dimensions: 'd',
      measures: 'm',
      numRows: 'r',
      seed: 's',
    });

    expect(generate).to.have.been.calledWithExactly({
      dimensions: 'd',
      measures: 'm',
      numRows: 'r',
      seed: 's',
    });

    expect(hc).to.eql('hc');
  });

  it('should return listobject', () => {
    const [qix] = doMock({ generate });

    generate.returns({
      qDimensionInfo: ['first'],
      qMeasureInfo: ['m'],
      qDataPages: 'pages',
      qSize: 'size',
    });

    const hc = qix.listobject({
      dimension: 'd',
      numRows: 'r',
      seed: 's',
    });

    expect(generate).to.have.been.calledWithExactly({
      dimensions: ['d'],
      numRows: 'r',
      seed: 's',
    });

    expect(hc).to.eql({
      qDimensionInfo: 'first',
      qDataPages: 'pages',
      qSize: 'size',
    });
  });
});

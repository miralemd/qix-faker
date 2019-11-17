const numeric = require('../lib/numeric');

const t = [
  ['0', 0],
  ['-0.2', -0.2],
  ['$5.4', 5.4],
  ['foo-3.14', -3.14],
];

describe('numeric', () => {
  it('should return numeric value from string', () => {
    const n = numeric();

    t.forEach(([str, num]) => {
      expect(n.num(str)).to.equal(num, str);
    });
  });

  it('should return "NaN" when valid numeric is not found', () => {
    const n = numeric();

    ['a'].forEach(str => {
      expect(n.num(str)).to.equal('NaN');
    });
  });

  it('should calculate valid min/max', () => {
    const n = numeric();
    n.num('a');
    n.num('5');
    n.num('-3');
    expect(n.min()).to.equal(-3, 'min');
    expect(n.max()).to.equal(5, 'max');
  });
});

/* eslint-disable no-undef */
const { expect } = require('chai');

describe('Froggies', async function () {
  let dev, owner, Froggies, froggies;
  const NAME = 'Froggies';
  const SYMBOL = 'FRG';
  const INITIAL_SUPPLY = ethers.utils.parseEther('100');
  beforeEach(async function () {
    [dev, owner] = await ethers.getSigners();
    Froggies = await ethers.getContractFactory('Froggies');
    froggies = await Froggies.connect(dev).deploy(owner.address, INITIAL_SUPPLY, NAME, SYMBOL);
    await froggies.deployed();
  });

  describe('Deployment', function () {
    it(`Should have name ${NAME}`, async function () {
      expect(await froggies.name()).to.equal(NAME);
    });
    it(`Should have name ${SYMBOL}`, async function () {
      expect(await froggies.symbol()).to.equal(SYMBOL);
    });
    it(`Should have total supply ${INITIAL_SUPPLY.toString()}`, async function () {
      expect(await froggies.totalSupply()).to.equal(INITIAL_SUPPLY);
    });
    it(`Should mint initial supply ${INITIAL_SUPPLY.toString()} to owner`, async function () {
      expect(await froggies.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
  });
});

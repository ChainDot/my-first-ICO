/* eslint-disable comma-dangle */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Calculator', function () {
  let dev, Froggies, froggies, ownerFroggies, alice, charlie, Calculator, calculator, ownerCalculator;
  const INITIAL_SUPPLY = ethers.utils.parseEther('10');
  const NAME = 'Froggies';
  const SYMBOL = 'FRG';
  const ONE_TOKEN = 10 ** 9;
  beforeEach(async function () {
    [dev, alice, charlie, ownerCalculator, ownerFroggies] = await ethers.getSigners();

    Froggies = await ethers.getContractFactory('Froggies');
    froggies = await Froggies.connect(dev).deploy(ownerFroggies.address, INITIAL_SUPPLY, NAME, SYMBOL);
    await froggies.deployed();

    Calculator = await ethers.getContractFactory('Calculator');
    calculator = await Calculator.connect(ownerCalculator).deploy(froggies.address, ONE_TOKEN);
    await calculator.deployed();

    await froggies.connect(ownerFroggies).transfer(alice.address, 5 * ONE_TOKEN);
    await froggies.connect(alice).approve(calculator.address, 5 * ONE_TOKEN);
  });

  describe('Deployment', function () {
    it('Should set the owner of calculator', async function () {
      expect(await calculator.owner()).to.equal(ownerCalculator.address);
    });
    it('Should set the froggies token address', async function () {
      expect(await calculator.froggiesTokenAddress()).to.equal(froggies.address);
    });
    it('Should set fees to fees function', async function () {
      expect(await calculator.fees()).to.equal(10 ** 9);
    });
  });

  describe('CALCULATOR', function () {
    it('Should remove 1 token from balance user when using the function ADD', async function () {
      expect(await froggies.connect(alice).balanceOf(alice.address)).to.equal(5 * ONE_TOKEN);
      await calculator.connect(alice).add(1, 1);
      expect(await froggies.connect(alice).balanceOf(alice.address)).to.equal(4 * ONE_TOKEN);
    });
    it('Should check the token balance change', async function () {
      await expect(() => calculator.connect(alice).add(1, 1)).to.changeTokenBalance(froggies, alice, -ONE_TOKEN);
    });
    it('Should emit result of ADD function', async function () {
      await expect(calculator.connect(alice).add(1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'add', 1, 1, 2);
      await expect(calculator.connect(alice).add(0, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'add', 0, 1, 1);
      await expect(calculator.connect(alice).add(-1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'add', -1, 1, 0);
      await expect(calculator.connect(alice).add(1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'add', 1, -1, 0);
      await expect(calculator.connect(alice).add(-1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'add', -1, -1, -2);
    });
    it('Should emit result of SUB function', async function () {
      await expect(calculator.connect(alice).sub(1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'sub', 1, 1, 0);
      await expect(calculator.connect(alice).sub(0, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'sub', 0, 1, -1);
      await expect(calculator.connect(alice).sub(-1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'sub', -1, 1, -2);
      await expect(calculator.connect(alice).sub(1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'sub', 1, -1, 2);
      await expect(calculator.connect(alice).sub(-1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'sub', -1, -1, 0);
    });
    it('Should emit result of MUL function', async function () {
      await expect(calculator.connect(alice).mul(1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mul', 1, 1, 1);
      await expect(calculator.connect(alice).mul(0, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mul', 0, 1, 0);
      await expect(calculator.connect(alice).mul(-1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mul', -1, 1, -1);
      await expect(calculator.connect(alice).mul(1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mul', 1, -1, -1);
      await expect(calculator.connect(alice).mul(-1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mul', -1, -1, 1);
    });
    it('Should emit result of DIV function', async function () {
      await expect(calculator.connect(alice).div(1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'div', 1, 1, 1);
      await expect(calculator.connect(alice).div(0, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'div', 0, 1, 0);
      await expect(calculator.connect(alice).div(-1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'div', -1, 1, -1);
      await expect(calculator.connect(alice).div(1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'div', 1, -1, -1);
      await expect(calculator.connect(alice).div(-1, -1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'div', -1, -1, 1);
    });
    it('Should emit result of MOD function', async function () {
      await expect(calculator.connect(alice).mod(1, 1))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mod', 1, 1, 0);
      await expect(calculator.connect(alice).mod(3, 2))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mod', 3, 2, 1);
      await expect(calculator.connect(alice).mod(2, 3))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mod', 2, 3, 2);
      await expect(calculator.connect(alice).mod(-3, -2))
        .to.emit(calculator, 'Calculated')
        .withArgs(alice.address, 'mod', -3, -2, -1);
    });
    it('Should revert if nb2 == 0 for div function ', async function () {
      await expect(calculator.connect(alice).div(1, 0)).to.be.revertedWith('Calculator: can not divide by zero');
    });
    it('Should revert if nb2 == 0 for mod function ', async function () {
      await expect(calculator.connect(alice).mod(1, 0)).to.be.revertedWith('Calculator: can not modulo by zero');
    });
    it('Should revert if insufficient token balance ', async function () {
      await froggies.connect(alice).transfer(ownerFroggies.address, 5 * ONE_TOKEN);
      await froggies.connect(alice).approve(calculator.address, 5 * ONE_TOKEN);
      await expect(calculator.connect(alice).add(1, 1)).to.be.revertedWith(
        'Calculator: insufficient balance please top up your account'
      );
    });
    it('Should revert if calculator contract have insufficient allowance', async function () {
      await froggies.connect(alice).approve(calculator.address, 1 * ONE_TOKEN);
      await calculator.connect(alice).add(1, 1);
      await expect(calculator.connect(alice).add(1, 1)).to.be.revertedWith(
        'Calculator: increase the calculator contract allowance'
      );
    });
  });

  describe('GETTERS', function () {
    it('Should show fees', async function () {
      expect(await calculator.connect(alice).fees()).to.equal(ONE_TOKEN);
    });
    it('Should show owner token balance', async function () {
      await calculator.connect(alice).add(1, 1);
      expect(await calculator.connect(alice).ownerTokenBalance()).to.equal(1);
    });
    it('Should show owner wei balance', async function () {
      await calculator.connect(alice).add(1, 1);
      expect(await calculator.connect(alice).ownerWeiBalance()).to.equal(10 ** 9);
    });
    it('Should show owner token froggies address', async function () {
      expect(await calculator.connect(charlie).froggiesTokenAddress()).to.equal(froggies.address);
    });
  });
});

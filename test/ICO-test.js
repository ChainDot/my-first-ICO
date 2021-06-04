/* eslint-disable no-undef */
const { expect } = require('chai');

describe('ICO', async function () {
  let dev, ownerICO, ownerFroggies, alice, bob, charlie, ICO, ico, Froggies, froggies;
  const RATE = 10 ** 9;
  const GWEI = 10 ** 9;
  const INITIAL_SUPPLY = ethers.utils.parseEther('1000');
  const NAME = 'Froggies';
  const SYMBOL = 'FRG';
  const WEEKS = 604800; // in secondes
  beforeEach(async function () {
    [dev, ownerICO, ownerFroggies, alice, bob, charlie] = await ethers.getSigners();
    Froggies = await ethers.getContractFactory('Froggies');
    froggies = await Froggies.connect(dev).deploy(ownerFroggies.address, INITIAL_SUPPLY, NAME, SYMBOL);
    await froggies.deployed();
    ICO = await ethers.getContractFactory('ICO');
    ico = await ICO.connect(ownerICO).deploy(ownerFroggies.address, froggies.address, RATE);
    await ico.deployed();
    await froggies.connect(ownerFroggies).approve(ico.address, INITIAL_SUPPLY);
  });

  describe('Deployment', function () {
    it('Should have a rate of ', async function () {
      expect(await ico.rate()).to.equal(RATE);
    });
    it('Should be the onwer address supplier of the Froggies contract', async function () {
      expect(await ico.OwnerSupplyAddress()).to.equal(ownerFroggies.address);
    });
    it('Should show the Froggies Address', async function () {
      expect(await ico.displayFroggiesTokenAddress()).to.equal(froggies.address);
    });
    it('Should revert if rate is set to zero or less', async function () {
      ICO = await ethers.getContractFactory('ICO');
      await expect(ICO.connect(ownerICO).deploy(ownerFroggies.address, froggies.address, 0)).to.be.revertedWith(
        'ICO: Sorry rate cannot be zero'
      );
    });
  });

  describe('buyTokens', function () {
    it('Should change the wei balance of the contract when someone buyTokens', async function () {
      await ico.connect(alice).buyTokens({ value: 2 * GWEI });
      await ico.connect(bob).buyTokens({ value: 2 * GWEI });
      expect(await ico.connect(alice).weiFundsRaised()).to.equal(4 * GWEI);
    });
    it('Should emit when use buyTokens()', async function () {
      await expect(ico.connect(bob).buyTokens({ value: 2 * GWEI }))
        .to.emit(ico, 'BoughtTokens')
        .withArgs(bob.address, 2 * GWEI);
    });
    it('Should emit when use buyTokens()', async function () {
      await expect(ico.connect(bob).buyTokens({ value: 2 * GWEI }))
        .to.emit(ico, 'BoughtTokens')
        .withArgs(bob.address, 2 * GWEI);
    });
    it('Should revert if sender try to buy less than 1 gwei', async function () {
      await expect(ico.connect(alice).buyTokens({ value: 10 ** 8 })).to.be.revertedWith(
        'ICO: You must buy as least 1 gwei'
      );
    });
    it('Should revert if sender send more than 10 gwei', async function () {
      await expect(ico.connect(charlie).buyTokens({ value: 11 * RATE })).to.be.revertedWith(
        'ICO: You cannot buy more than 10 gwei'
      );
    });
    it('Should revert if you try to buyTokens once the ICO has endend', async function () {
      await ethers.provider.send('evm_increaseTime', [2 * WEEKS]);
      await expect(ico.connect(alice).buyTokens({ value: 2 * RATE })).to.be.revertedWith(
        'ICO: Too late the offer has ended'
      );
    });
    it('Should revert', async function () {});
  });

  describe('withdraw', function () {
    it('should set to zero the balance of ico address when owner withdraw', async function () {
      await ico.connect(alice).buyTokens({ value: 2 * GWEI });
      await ethers.provider.send('evm_increaseTime', [2 * WEEKS]);
      expect(await ico.connect(ownerICO).weiFundsRaised()).to.equal(2 * GWEI);
      await ico.connect(ownerICO).withdraw();
      expect(await ico.connect(ownerICO).weiFundsRaised()).to.equal(0);
    });
    it('should emit event withdrew when owner withdraw', async function () {
      await ico.connect(bob).buyTokens({ value: 2 * GWEI });
      await ethers.provider.send('evm_increaseTime', [2 * WEEKS]);
      expect(await ico.connect(ownerICO).weiFundsRaised()).to.equal(2 * GWEI);
      await expect(ico.connect(ownerICO).withdraw())
        .to.emit(ico, 'Withdrew')
        .withArgs(ownerICO.address, 2 * GWEI);
    });
    it('Should revert if owner have zero balance in contract', async function () {
      await expect(ico.connect(ownerICO).withdraw()).to.be.revertedWith('ICO: 0 balance nobody bought your shitcoin');
    });
    it('Should revert if owner try to withdraw before the end of the ICO', async function () {
      await ico.connect(bob).buyTokens({ value: RATE });
      await expect(ico.connect(ownerICO).withdraw()).to.be.revertedWith(
        'ICO: You have to wait till the end of the ICO'
      );
    });
    it('Should revert if you are not the owner and you try to withdraw', async function () {
      await expect(ico.connect(bob).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('getters', function () {
    it('shows the owner address of Froggies contract', async function () {
      expect(await ico.connect(bob).OwnerSupplyAddress()).to.equal(ownerFroggies.address);
    });
    it('shows address of contract token Froggies', async function () {
      expect(await ico.connect(bob).displayFroggiesTokenAddress()).to.equal(froggies.address);
    });
    it('converts amount of wei to number of token', async function () {
      expect(await ico.connect(bob).numberOfTokens(2 * GWEI)).to.equal(2);
    });
    it('shows total amount of wei raised', async function () {
      await ico.connect(bob).buyTokens({ value: 2 * GWEI });
      expect(await ico.connect(dev).weiFundsRaised()).to.equal(2 * GWEI);
    });
    it('shows total token sold', async function () {
      await ico.connect(bob).buyTokens({ value: 3 * GWEI });
      expect(await ico.connect(bob).totalTokenSold()).to.equal(3);
    });
    it('shows rate per token', async function () {
      expect(await ico.connect(bob).rate()).to.equal(RATE);
    });
    it('shows time remaining in secondes', async function () {
      expect(await ico.connect(bob).releaseTime()).to.equal(2 * WEEKS - 1);
    });
  });
});

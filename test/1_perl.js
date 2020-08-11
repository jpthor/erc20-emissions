const { expect } = require("chai");
var Perlin1 = artifacts.require('./Perlin1.sol')
var Perlin = artifacts.require('./Perlin.sol')
const BigNumber = require('bignumber.js')
const truffleAssert = require('truffle-assertions')

function BN2Str(BN) { return ((new BigNumber(BN)).toFixed()) }
function getBN(BN) { return (new BigNumber(BN)) }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var perlin1; var perlin;
var acc0; var acc1; var acc2; var acc3; var acc4;
const one = 10**18

before(async function() {
  accounts = await ethers.getSigners();
  acc0 = await accounts[0].getAddress()
  acc1 = await accounts[1].getAddress()
  acc2 = await accounts[2].getAddress()
  acc3 = await accounts[3].getAddress()
  acc4 = await accounts[4].getAddress()

  perlin1 = await Perlin1.new();
  perlin = await Perlin.new(perlin1.address);
  await perlin1.transfer(acc1, BN2Str(348561216 * one))
  await perlin1.transfer(acc2, BN2Str(134609604 * one))
})

describe("Deploy", function() {
  it("Should deploy", async function() {
    expect(await perlin.name()).to.equal("Perlin");
    expect(await perlin.symbol()).to.equal("PERL");
    expect(BN2Str(await perlin.decimals())).to.equal('18');
    expect(BN2Str(await perlin.totalSupply())).to.equal('0');
    expect(BN2Str(await perlin.totalCap())).to.equal(BN2Str(3000000000 * one));
    expect(BN2Str(await perlin.emissionCurve())).to.equal('2048');
    expect(await perlin.emitting()).to.equal(false);
    expect(BN2Str(await perlin.currentEra())).to.equal('1');
    expect(BN2Str(await perlin.secondsPerEra())).to.equal('1');
    // console.log(BN2Str(await perlin.nextEraTime()));
    expect(await perlin.DAO()).to.equal(acc0);
    expect(await perlin.perlin1()).to.equal(perlin1.address);
    expect(await perlin.burnAddress()).to.equal("0x0000000000000000000000000000000000000001");
    expect(BN2Str(await perlin.getDailyEmission())).to.equal(BN2Str('0'));
  });
});

describe("Upgrade", function() {
  it("Should upgrade", async function() {
    let balance = await perlin1.balanceOf(acc1)
    await perlin1.approve(perlin.address, balance, {from:acc1})
    await perlin.upgrade({from:acc1})
    expect(BN2Str(await perlin.totalSupply())).to.equal(BN2Str(balance));
    expect(BN2Str(await perlin1.balanceOf(acc1))).to.equal('0');
    expect(BN2Str(await perlin.balanceOf(acc1))).to.equal(BN2Str(balance));
    expect(BN2Str(await perlin.getDailyEmission())).to.equal(BN2Str('323985006206445993031358'));
  });
  it("Should upgrade to next drop", async function() {
    let balance = await perlin1.balanceOf(acc2)
    await perlin1.approve(perlin.address, balance, {from:acc2})
    await perlin.upgrade({from:acc2})
    expect(BN2Str(await perlin.totalSupply())).to.equal(BN2Str('483170820000000000000000000'));
    expect(BN2Str(await perlin1.balanceOf(acc2))).to.equal('0');
    expect(BN2Str(await perlin.balanceOf(acc2))).to.equal(BN2Str(balance));
    expect(BN2Str(await perlin.getDailyEmission())).to.equal(BN2Str('449103612022266986062717'));
  });
  it("Should upgrade to full", async function() {
    let balance = await perlin1.balanceOf(acc0)
    await perlin1.approve(perlin.address, balance, {from:acc0})
    await perlin.upgrade({from:acc0})
    expect(BN2Str(await perlin.totalSupply())).to.equal(BN2Str('1033200000000000000000000000'));
    expect(BN2Str(await perlin1.balanceOf(acc0))).to.equal('0');
    expect(BN2Str(await perlin.balanceOf(acc0))).to.equal(BN2Str(balance));
    expect(BN2Str(await perlin.getDailyEmission())).to.equal(BN2Str('960351562500000000000000'));
  });
});

describe("Be a valid ERC-20", function() {
  it("Should transfer From", async function() {
    await perlin.approve(acc4, "1000") 
    expect(BN2Str(await perlin.allowance(acc0, acc4))).to.equal('1000');
    await perlin.transferFrom(acc0, acc4, "1000", {from:acc4})
    expect(BN2Str(await perlin.balanceOf(acc4))).to.equal('1000');
  });
  it("Should burn", async function() {
    await perlin.burn("500", {from:acc4})
    expect(BN2Str(await perlin.balanceOf(acc4))).to.equal('500');
    expect(BN2Str(await perlin.totalSupply())).to.equal(BN2Str('1033199999999999999999999500'));

  });
  it("Should burn from", async function() {
    await perlin.approve(acc2, "500", {from:acc4}) 
    expect(BN2Str(await perlin.allowance(acc4, acc2))).to.equal('500');
    await perlin.burnFrom(acc4, "500", {from:acc2})
    expect(BN2Str(await perlin.balanceOf(acc4))).to.equal('0');
    expect(BN2Str(await perlin.totalSupply())).to.equal(BN2Str('1033199999999999999999999000'));

  });
});

describe("DAO Functions", function() {
  it("Non-DAO fails", async function() {
    await truffleAssert.reverts(perlin.startEmissions({from:acc1}))
  });
  it("DAO changeEmissionCurve", async function() {
    await perlin.changeEmissionCurve('1024')
    expect(BN2Str(await perlin.emissionCurve())).to.equal('1024');
  });
  it("DAO changeIncentiveAddress", async function() {
    await perlin.changeIncentiveAddress(acc3)
    expect(await perlin.incentiveAddress()).to.equal(acc3);
  });
  it("DAO changeToken", async function() {
    await perlin.changeToken("Perlin2", "PERL2")
    expect(await perlin.name()).to.equal("Perlin2");
    expect(await perlin.symbol()).to.equal("PERL2");
  });
  it("DAO changeEraDuration", async function() {
    await perlin.changeEraDuration('2')
    expect(BN2Str(await perlin.secondsPerEra())).to.equal('2');
  });
  it("DAO changeDAO", async function() {
    await perlin.changeDAO(acc2)
    expect(await perlin.DAO()).to.equal(acc2);
  });
  it("DAO start emitting", async function() {
    await perlin.startEmissions({from:acc2})
    expect(await perlin.emitting()).to.equal(true);
  });
  
  it("Old DAO fails", async function() {
    await truffleAssert.reverts(perlin.startEmissions())
  });
});

describe("Emissions", function() {
  it("Should emit properly", async function() {
    expect(BN2Str(await perlin.getDailyEmission())).to.equal(BN2Str('1920703124999999999999998'));
    // await sleep(2000)
    await perlin.transfer(acc1, BN2Str(1000000 * one))
    await perlin.transfer(acc0, BN2Str(1000000 * one), {from:acc1})
    expect(BN2Str(await perlin.currentEra())).to.equal('2');
    expect(BN2Str(await perlin.balanceOf(acc3))).to.equal(BN2Str('1920703124999999999999998'));
    expect(BN2Str(await perlin.getDailyEmission())).to.equal(BN2Str('1924273682969787810322297'));
    
    await sleep(2000)
    await perlin.transfer(acc1, BN2Str(1000000 * one))
    expect(BN2Str(await perlin.currentEra())).to.equal('3');
    expect(BN2Str(await perlin.balanceOf(acc3))).to.equal(BN2Str('3844976807969787810322295'));
    expect(BN2Str(await perlin.getDailyEmission())).to.equal(BN2Str('1927850878552671405684157'));
  });
});

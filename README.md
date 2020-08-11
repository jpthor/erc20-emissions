# ERC20 with Emissions


## ERC-20 Functions
* mintable
* burnable

## Upgrade
* User can upgrade from previous asset
* Old asset burnt, new asset minted and issued

## Emissions
* Emission Curve targets a smooth curve from 33% to 3% after 10 years
* Supply Unlock agnostic (adjusts based on total supply minted from upgrading)
* Block speed agnostic (uses blocktimes)
* Asymptotes to 3bn
* Emits every "era" (around 24hours) to an address that can be set

```
adjustedTotalCap = 3,000,000,000 * (totalSupply) / 1,033,200,000
dailyEmissions = (adjustedTotalCap - totalSupply) / emissionCurve
```

## DAO

DAO can change:
* emissionCurve
* incentiveAddress (where the reward goes)
* tokenParams (new brand)
* Era Time
* DAO address

# Testing
```
yarn 
npx buidler test
```


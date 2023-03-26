const hre = require('hardhat')
const namehash = require('eth-ens-namehash')
const tld = 'astra'
const ethers = hre.ethers
const utils = ethers.utils
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

const ensAddr = '0x61FFcD00ffa1Af6B3a66F354008885E6aC62586f'
// const registrar = '0x39b05E5D8147B3673fADe39E8eE0749Fe830CCd7'
const main = async () => {
  const ENSRegistry = await ethers.getContractAt('ENSRegistry', ensAddr)

  const registraAddr = await ENSRegistry.owner(namehash.hash(tld))

  const FIFSRegistrar = await ethers.getContractAt(
    'FIFSRegistrar',
    registraAddr,
  )
  const signers = await ethers.getSigners()
  const accounts = signers.map((s) => s.address)

  // const register = await FIFSRegistrar.register(
  //   namehash.hash('abc'),
  //   accounts[0],
  // )
  // console.log(register)

  const resolveAdr = await ENSRegistry.resolver(namehash.hash('resolver'))
  console.log('owner', registraAddr)
  console.log('resolveAdr', resolveAdr)
  const PublicResolver = await ethers.getContractAt(
    'PublicResolver',
    resolveAdr,
  )

  const result = await PublicResolver['addr(bytes32)'](namehash.hash('abc'))

  const test = await ENSRegistry.owner(namehash.hash('abc'))

  const a = await ENSRegistry.resolver(namehash.hash('abc'))
  console.log(a)
  console.log(test)
  console.log('test', result)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

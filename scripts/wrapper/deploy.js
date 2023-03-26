const hre = require('hardhat')
const namehash = require('eth-ens-namehash')
const tld = 'astra'
const ethers = hre.ethers
const utils = ethers.utils
const labelhash = (label) => utils.keccak256(utils.toUtf8Bytes(label))
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const ZERO_HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
async function main() {
  const ENSRegistry = await ethers.getContractFactory('ENSRegistry')
  const FIFSRegistrar = await ethers.getContractFactory('FIFSRegistrar')
  const ReverseRegistrar = await ethers.getContractFactory('ReverseRegistrar')
  const PublicResolver = await ethers.getContractFactory('PublicResolver')
  const ETHRegistrarController = await ethers.getContractFactory(
    'ETHRegistrarController',
  )
  const signers = await ethers.getSigners()
  const accounts = signers.map((s) => s.address)

  const ens = await ENSRegistry.deploy()
  await ens.deployed()
  console.log('done ENSRegistry=', ens.address)

  const reverseRegistrar = await ReverseRegistrar.deploy(ens.address)
  await reverseRegistrar.deployed()

  const resolver = await PublicResolver.deploy(
    ens.address,
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    reverseRegistrar.address,
  )
  await resolver.deployed()
  console.log('done PublicResolver')

  await setupResolver(ens, resolver, accounts)
  console.log('done setupResolver')

  const registrar = await FIFSRegistrar.deploy(ens.address, namehash.hash(tld))
  await registrar.deployed()
  console.log('done registrar', registrar.address)

  await setupRegistrar(ens, registrar)
  console.log('done setupRegistrar')

  await setupReverseRegistrar(ens, registrar, reverseRegistrar, accounts)
  console.log('done setupReverseRegistrar')
}

async function setupResolver(ens, resolver, accounts) {
  const resolverNode = namehash.hash('resolver')
  const resolverLabel = labelhash('resolver')
  await ens.setSubnodeOwner(ZERO_HASH, resolverLabel, accounts[0])

  await ens.setResolver(resolverNode, resolver.address, {
    gasLimit: 3000000,
  })

  await resolver['setAddr(bytes32,address)'](resolverNode, resolver.address, {
    gasLimit: 3000000,
  })
}

async function setupRegistrar(ens, registrar) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash(tld), registrar.address, {
    gasLimit: 3000000,
  })
}

async function setupReverseRegistrar(
  ens,
  registrar,
  reverseRegistrar,
  accounts,
) {
  await ens.setSubnodeOwner(ZERO_HASH, labelhash('reverse'), accounts[0], {
    gasLimit: 3000000,
  })
  await ens.setSubnodeOwner(
    namehash.hash('reverse'),
    labelhash('addr'),
    reverseRegistrar.address,
    {
      gasLimit: 3000000,
    },
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

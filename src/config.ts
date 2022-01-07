import { cosmiconfigSync } from 'cosmiconfig';
import { cwd } from 'process';

const configFileName = 'elventools';

const explorerSync = cosmiconfigSync(configFileName);
const customConfig = explorerSync.search(cwd());

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Global settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// Chain to be used (local, devnet, testnet, mainnet)
export const chain = customConfig?.config?.chain || 'devnet';

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// NFT minter smart contract
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// This is useful when you have already deployed the smart contract and you want to interact
// Otherwise, after deployment using this tool, it will be saved in the temp file for further usage
export const nftMinterScAddress =
  customConfig?.config?.nftMinterSc?.deployNftMinterSC;

// Gas limit required for the deployment
export const deployNftMinterGasLimit =
  customConfig?.config?.nftMinterSc?.deployGasLimit || 80000000;

// The tag from the SC's GitHub repository, it can be release tag like v0.1.1 or branch name
export const deployNftMinterScVersion =
  customConfig?.config?.nftMinterSc?.version || 'main';

// Gas limit required for the collection token issuance
export const issueNftMinterGasLimit =
  customConfig?.config?.nftMinterSc?.issueCollectionTokenGasLimit || 60000000;

// Value required for the collection token issuance  (1 = 1 EGLD)
export const issueNftMinterValue =
  customConfig?.config?.nftMinterSc?.issueValue || 0.05;

// Gas limit required for the collection token roles assignment
export const assignRolesNftMinterGasLimit =
  customConfig?.config?.nftMinterSc?.assignRolesGasLimit || 60000000;

// Issue collection token function name on the SC
export const issueTokenFnName =
  customConfig?.config?.nftMinterSc?.issueTokenFnName || 'issueToken';

// Function name for setting the roles for collection token on the SC
export const setLocalRolesFnName =
  customConfig?.config?.nftMinterSc?.setLocalRolesFnName || 'setLocalRoles';

// Get NFT collection token query function name on SC
export const getNftTokenIdFnName =
  customConfig?.config?.nftMinterSc?.getNftTokenIdFnName || 'getNftTokenId';

// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
// Other predefined config settings
// ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡

// Default will be devnet, based on chain value, if the local is chosen you can change the proxy host
export const proxyGateways: { [key: string]: string } = {
  local: customConfig?.config?.localProxyGateway || 'http://localhost:7950',
  testnet: 'https://testnet-gateway.elrond.com',
  devnet: 'https://devnet-gateway.elrond.com',
  mainnet: 'https://gateway.elrond.com',
};

export const derivePemSeedQuestion = 'Enter mnemonic (seed phrase)';
export const collectionTokenNameLabel =
  'Enter the name for the collection token (ex. MyName123). Avoid spaces and special characters\n';
export const collectionTokenTickerLabel =
  'Enter the ticker for the collection token (ex. MYNAME). Avoid spaces and special characters. Keep it short and capitalize.\n';

export const deployNftMinterImgCidLabel = 'Provide image IPFS CID:\n';
export const deployNftMinterMetaCidLabel = 'Provide metadata IPFS CID:\n';
export const deployNftMinterAmountOfTokensLabel =
  'Provide amount of tokens in collection:\n';
export const deployNftMinterSellingPriceLabel =
  'Provide the seling price (ex. 0.5 for 0.5 EGLD):\n';
export const deployNftMinterRoyaltiesLabel =
  'Provide the royalties value (ex. 20 for 20%) [optional]:\n';
export const deployNftMinterMintingStartTimeLabel =
  'Provide minting start date (unix epoch timestamp in seconds), by default it will be current time (ex. 1641552723) [optional]:\n';
export const deployNftMinterMintingEndTimeLabel =
  'Provide minting end date (unix epoch timestamp in seconds), by default it will be Infinity (ex. 1641552723) [optional]:\n';
export const deployNftMinterTagsLabel =
  'Provide tags (ex. tag1,tag2,tag3) [optional]:\n';
export const deployNftMinterProvenanceHashLabel =
  'Provide the provenance hash (sha256 hash of all images) [optional]:\n';

// Pem file name - generated by this tool
export const pemKeyFileName = 'walletKey.pem';

// Path to custom abi and wasm files when you don't want to use the repo version
// Relative to cmd
export const deployNftMinterSCabiRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.abi.json';
export const deployNftMinterSCwasmRelativeFilePath =
  'sc/nft-minter/elven-nft-minter.wasm';

// Urls to the repo, when there are no local files
export const deployNftMinterSCabiFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/${deployNftMinterScVersion}/output/elven-nft-minter.abi.json`;
export const deployNftMinterSCwasmFileUrl = `https://raw.githubusercontent.com/juliancwirko/elven-nft-minter-sc/${deployNftMinterScVersion}/output/elven-nft-minter.wasm`;

// Used for output data like the smart contract address after deploy
export const outputFileName = 'output.json';

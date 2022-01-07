import {
  ProxyProvider,
  IProvider,
  NetworkConfig,
  SmartContract,
  Account,
  parseUserKey,
  UserSigner,
  SmartContractAbi,
  Code,
  GasLimit,
  AbiRegistry,
  Address,
  ContractFunction,
  BytesValue,
  Balance,
  U32Value,
  U64Value,
  BigUIntValue,
} from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';
import { readFileSync, accessSync, constants, writeFileSync } from 'fs';
import { exit, cwd } from 'process';
import {
  proxyGateways,
  chain,
  outputFileName,
  issueTokenFnName,
  setLocalRolesFnName,
  getNftTokenIdFnName,
  nftMinterScAddress,
} from './config';

export const baseDir = cwd();

export const getFileContents = (
  relativeFilePath: string,
  options: { isJSON?: boolean; noExitOnError?: boolean }
) => {
  const isJSON = options.isJSON === undefined ? true : options.isJSON;
  const noExitOnError =
    options.noExitOnError === undefined ? false : options.noExitOnError;

  const filePath = `${baseDir}/${relativeFilePath}`;

  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
  } catch (err) {
    if (!noExitOnError) {
      console.error(`There is no ${relativeFilePath}!`);
      exit(9);
    } else {
      return undefined;
    }
  }

  const rawFile = readFileSync(filePath);
  const fileString = rawFile.toString('utf8');

  if (isJSON) {
    return JSON.parse(fileString);
  }
  return fileString;
};

export const getProvider = () => {
  return new ProxyProvider(proxyGateways[chain], { timeout: 5000 });
};

// Sync proper chain, for example, the devnet
export const syncProviderConfig = async (provider: IProvider) => {
  return NetworkConfig.getDefault().sync(provider);
};

export const createSmartContractInstance = (
  abi?: AbiRegistry,
  address?: string
) => {
  const contract = new SmartContract({
    address: address ? new Address(address) : undefined,
    abi:
      abi &&
      new SmartContractAbi(
        abi,
        abi.interfaces.map((iface) => iface.name)
      ),
  });
  return contract;
};

// Prepare main user account from the wallet PEM file
export const prepareUserAccount = async (walletPemKey: string) => {
  const userKey = parseUserKey(walletPemKey);
  const address = userKey.generatePublicKey().toAddress();
  return new Account(address);
};

export const prepareUserSigner = (walletPemKey: string) => {
  return UserSigner.fromPem(walletPemKey);
};

export const getAbi = (filePath: string, url: string) => {
  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
    return AbiRegistry.load({ files: [filePath] });
  } catch {
    return AbiRegistry.load({ urls: [url] });
  }
};

export const getScWasmCode = (filePath: string, url: string) => {
  try {
    accessSync(filePath, constants.R_OK | constants.W_OK);
    return Code.fromFile(filePath);
  } catch {
    return Code.fromUrl(url);
  }
};

export const getDeployTransaction = (
  code: Code,
  contract: SmartContract,
  gasLimit: number,
  imgBaseCid: string,
  metadataBaseCid: string,
  numberOfTokens: number,
  sellingPrice: string,
  royalties?: string,
  startTimestamp?: number,
  endTimestamp?: number,
  tags?: string,
  provenanceHash?: string
) => {
  return contract.deploy({
    code,
    gasLimit: new GasLimit(gasLimit),
    initArguments: [
      BytesValue.fromUTF8(imgBaseCid),
      BytesValue.fromUTF8(metadataBaseCid),
      new U32Value(numberOfTokens),
      new U64Value(
        new BigNumber(startTimestamp || new Date().getTime() / 1000)
      ),
      new U64Value(new BigNumber(endTimestamp || 8640000000000000)),
      new BigUIntValue(new BigNumber(Number(royalties) * 100 || 0)),
      new BigUIntValue(Balance.egld(sellingPrice).valueOf()),
      BytesValue.fromUTF8(tags || ''),
      BytesValue.fromUTF8(provenanceHash || ''),
    ],
  });
};

export const saveOutputAfterDeploy = ({
  scAddress,
  sellingPrice,
}: {
  scAddress: Address;
  sellingPrice: string;
}) => {
  const outputFilePath = `${baseDir}/${outputFileName}`;
  try {
    accessSync(outputFilePath, constants.R_OK | constants.W_OK);
    const configFile = readFileSync(outputFilePath, { encoding: 'utf8' });
    const newConfigFile = {
      ...JSON.parse(configFile),
      nftMinterScAddress: scAddress.bech32(),
      nftMinterScCollectionSellingPrice: Balance.egld(sellingPrice).toString(),
    };
    return writeFileSync(
      outputFilePath,
      JSON.stringify(newConfigFile, null, 2)
    );
  } catch {
    return writeFileSync(
      outputFilePath,
      JSON.stringify(
        {
          nftMinterScAddress: scAddress.bech32(),
          nftMinterScCollectionSellingPrice:
            Balance.egld(sellingPrice).toString(),
        },
        null,
        2
      )
    );
  }
};

export const saveCollectionTokenAfterIssuance = (tokenId: string) => {
  const outputFilePath = `${baseDir}/${outputFileName}`;
  try {
    accessSync(outputFilePath, constants.R_OK | constants.W_OK);
    const configFile = readFileSync(outputFilePath, { encoding: 'utf8' });
    const newConfigFile = {
      ...JSON.parse(configFile),
      nftMinterCollectionToken: tokenId,
    };
    return writeFileSync(
      outputFilePath,
      JSON.stringify(newConfigFile, null, 2)
    );
  } catch {
    return writeFileSync(
      outputFilePath,
      JSON.stringify({ nftMinterCollectionToken: tokenId }, null, 2)
    );
  }
};

export const getIssueTransaction = (
  contract: SmartContract,
  gasLimit: number,
  value: number, // mandatory 0.05 EGLD
  tokenName: string,
  tokenTicker: string
) => {
  return contract.call({
    func: new ContractFunction(issueTokenFnName),
    args: [BytesValue.fromUTF8(tokenName), BytesValue.fromUTF8(tokenTicker)],
    value: Balance.egld(value),
    gasLimit: new GasLimit(gasLimit),
  });
};

export const getIssuedToken = (
  provider: ProxyProvider,
  smartContract: SmartContract
) => {
  return smartContract.runQuery(provider, {
    func: new ContractFunction(getNftTokenIdFnName),
  });
};

export const getTheSCAddressFromOutputOrConfig = () => {
  const output = getFileContents(outputFileName, { noExitOnError: true });
  const smartContractAddress = output?.nftMinterScAddress || nftMinterScAddress;

  if (!smartContractAddress) {
    console.log(
      "Smart Contract address isn't provided. Please deploy it or add the address to the configuration if it is already deployed."
    );
    exit(9);
  }
  return smartContractAddress;
};

export const getAssignRolesTransaction = (
  contract: SmartContract,
  gasLimit: number
) => {
  return contract.call({
    func: new ContractFunction(setLocalRolesFnName),
    gasLimit: new GasLimit(gasLimit),
  });
};

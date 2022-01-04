import { exit } from 'process';
import { unlinkSync } from 'fs';
import ora from 'ora';
import { setup } from './setup';
import { deployNftMinterGasLimit, outputFileName } from './config';
import {
  getDeployTransaction,
  saveSCAddressAfterDeploy,
  getFileContents,
  baseDir,
} from './utils';

const deployNftMinter = async () => {
  // Check if there is an old output file
  const outputFile = getFileContents(outputFileName, { noExitOnError: true });

  if (outputFile) {
    unlinkSync(`${baseDir}/${outputFileName}`);
  }

  try {
    const { scWasmCode, smartContract, userAccount, signer, provider } =
      await setup();

    const deployTransaction = getDeployTransaction(
      scWasmCode,
      smartContract,
      deployNftMinterGasLimit,
      // TODO: mocks for now, just for SC testing
      'imageBaseCidTest',
      'metadataBaseCidTest',
      100,
      1641244846,
      1656876046,
      '1000',
      '1000000000000000000',
      'test1,test2,test3',
      'fake_provenance_hash'
    );

    deployTransaction.setNonce(userAccount.nonce);
    userAccount.incrementNonce();
    signer.sign(deployTransaction);

    const spinner = ora('Processing transaction...');
    spinner.start();

    await deployTransaction.send(provider);
    await deployTransaction.awaitExecuted(provider);
    const txStatus = deployTransaction.getStatus();

    spinner.stop();

    console.log(`Deployment transaction executed: ${txStatus}`);
    const scAddress = smartContract.getAddress();
    console.log(`Smart Contract address: ${scAddress}`);
    saveSCAddressAfterDeploy(scAddress);
  } catch (e) {
    console.log(e);
  }
};

export const deploy = async (subcommand?: string) => {
  const COMMANDS = {
    nftMinter: 'nft-minter',
  };

  if (!subcommand || !Object.values(COMMANDS).includes(subcommand)) {
    console.log(
      `Plaese provide a proper deploy command. Available commands: ${Object.values(
        COMMANDS
      ).join(', ')}`
    );
    exit(9);
  }

  if (subcommand === COMMANDS.nftMinter) {
    deployNftMinter();
  }
};

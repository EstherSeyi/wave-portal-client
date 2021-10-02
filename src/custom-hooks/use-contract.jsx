import { ethers } from "ethers";

export const useContract = (contractAddress, abi) => {
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const waveportalContract = new ethers.Contract(contractAddress, abi, signer);

  return { waveportalContract };
};

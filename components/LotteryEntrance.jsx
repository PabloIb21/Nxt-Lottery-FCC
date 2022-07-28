import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { useNotification } from "web3uikit";
import { abi, contractAddresses } from "../constants";

export const LotteryEntrance = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const [entranceFee, setEntranceFee] = useState("0");
  const [numPlayers, setNumPlayers] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0x0");

  const dispatch = useNotification();

  const { 
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });

  const updateUI = async () => {
    const entranceFeeFromCall= (await getEntranceFee()).toString();
    const numPlayersFromCall= (await getNumberOfPlayers()).toString();
    const recentWinnerFromCall= (await getRecentWinner()).toString();
    setEntranceFee(entranceFeeFromCall);
    setNumPlayers(numPlayersFromCall);
    setRecentWinner(recentWinnerFromCall);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification(tx);
    updateUI();
  }

  const handleNewNotification = async (tx) =>{
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  }

  return (
    <div className="p-5">
      { raffleAddress ? (
        <>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
            onClick={ async () => await enterRaffle({
              onSuccess: handleSuccess,
              onError: error => console.log(error),
            })}
            disabled={isLoading || isFetching}
          >
            { isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              "Enter Raffle"
            )}
          </button>
          <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
          <div>The current number of players is: {numPlayers}</div>
          <div>The most previous winner was: {recentWinner}</div>
        </>
      ) : (
        <div>Please connect to a supported chain </div>
      )}
    </div>
  );
};

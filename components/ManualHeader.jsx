import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export const ManualHeader = () => {
  const { enableWeb3, account, isWeb3Enabled, deactivateWeb3, Moralis, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("web3Enabled")) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged(account => {
      console.log(`Account change to ${account}`);
      if (account === null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null account found");
      }
    });
  }, []);

  return (
    <div>
      { account ? (
        <p>Connected to {account.slice(0,6)}...{account.slice(account.length - 4)}</p>
      ) : (
        <button 
          onClick={async () => {
            await enableWeb3();
            if (typeof window !== "undefined") {
              window.localStorage.setItem("connected", "injected");
            }
          }}
          disabled={isWeb3EnableLoading}
        >Connect</button>
      )}
    </div>
  );
};

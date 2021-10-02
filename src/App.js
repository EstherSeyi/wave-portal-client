import * as React from "react";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";
import randomColor from "randomcolor";
import format from "date-fns/format";

import waveportal from "./utils/WavePortal.json";
import { useContract } from "./custom-hooks/use-contract";

import { ReactComponent as Info } from "./assets/info.svg";

const StyledSection = styled.section`
  min-height: 100vh;
  /* background-color: #f9e6fc; */
  padding: 2em;
  .connect-button,
  .waveButton {
    margin-left: auto;
    display: block;
    border: none;
    background-color: #5c3882;
    color: #ffffff;
    padding: 0.5em 1em;
    border-radius: 3px;
  }
  .main-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    margin-top: 2em;
  }
  .header,
  .bio {
    text-align: center;
    margin-bottom: 2em;
  }
  .header {
    margin-bottom: 0.75em;
  }
  .fav-color {
    display: flex;
    flex-direction: column;
    text-align: center;
  }
  .fav_color_input {
    margin: 1em 0;
    outline: none;
    padding: 0.5em;
    border: 1px solid #5c3882;
    border-radius: 4px;
    background-color: transparent;
  }
`;

export default function App() {
  const [favColor, setFavColor] = React.useState("");
  const [waves, setWaves] = React.useState([]);
  const [waveLoading, setWaveLoading] = React.useState(false);
  const [totalWaves, setTotalWaves] = React.useState(0);
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const { waveportalContract } = useContract(contractAddress, waveportal.abi);

  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = React.useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        // console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please get the Metamask browser extension");
        return;
      }

      const accounts = ethereum.request({
        method: "eth_requestAccounts",
      });

      // console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const waves = await waveportalContract.getAllWaves();
        let count = await waveportalContract.getTotalWaves();

        setTotalWaves(count.toNumber());

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
            color: randomColor({ luminosity: "light" }),
          });
        });

        setWaves(wavesCleaned);

        waveportalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setWaves((prevState) => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
              color: randomColor({ luminosity: "light" }),
            },
          ]);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Create a method that gets all waves from your contract
   */
  const cleanWaves = async (dirtyWaves) => {
    try {
      /*
       * We only need address, timestamp, and message in our UI so let's
       * pick those out
       */
      let wavesCleaned = [];
      dirtyWaves.forEach((wave) => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
          color: randomColor({ luminosity: "light" }),
        });
      });

      /*
       * Store our data in React State
       */
      setWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async (favColor) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        let count = await waveportalContract.getTotalWaves();
        setWaveLoading(true);
        const waveTxn = await waveportalContract.wave(favColor, {
          gasLimit: 300000,
        });

        await waveTxn.wait();
        // console.log("Mined -- ", waveTxn.hash);

        count = await waveportalContract.getTotalWaves();
        setTotalWaves(count.toNumber());
        let allWaves = await waveportalContract.getAllWaves();
        await cleanWaves(allWaves);
        setFavColor("");
        setWaveLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getAllWaves();
    // eslint-disable-next-line
  }, []);
  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const handleInputChange = ({ target }) => {
    setFavColor(target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (favColor?.length) {
      wave(favColor);
    } else {
      alert("Please leave me a message 😭");
    }
  };

  return (
    <StyledSection>
      {!currentAccount ? (
        <button
          type="button"
          className="ml-auto block bg-purple-50 p-2 rounded-md shadow"
          onClick={handleConnectWallet}
        >
          Connect Wallet
        </button>
      ) : null}
      <div className="w-full max-w-3xl mx-auto mt-8">
        <div className="dataContainer">
          <div className="header">
            <span role="img" aria-label="wave emoji">
              👋
            </span>{" "}
            Hey there!
          </div>

          <div className="bio">I am Seyi</div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="fav_color" className="fav-color">
              <span>Tell me something</span>
              <input
                id="fav_color"
                className="border border-purple-50 py-2 pl-2 rounded-md focus:outline-black my-4"
                placeholder="your message..."
                onChange={handleInputChange}
                value={favColor}
              />
            </label>

            <button
              type="submit"
              className="mx-auto block bg-purple-50 p-2 rounded-md shadow"
            >
              {waveLoading ? "Loading..." : "Wave at Me"}
            </button>
          </form>
          <div className="my-4">
            <span className="font-semibold mr-2">Total waves:</span>
            <span>{totalWaves}</span>
          </div>

          <div
            className={`mt-10 grid ${
              waves?.length >= 1 && waves.length < 4
                ? "grid-cols-automax"
                : "grid-cols-200"
            }  gap-4
  `}
          >
            {waves.map((wave, index) => {
              return (
                <div
                  key={index}
                  className="bg-misc-white p-3 rounded-md shadow-lg w-full xs:w-11/12 sm:w-full mx-auto sm:max-w-[250px] h-40 flex flex-col justify-between"
                  style={{ backgroundColor: wave.color }}
                >
                  <div className="overflow-y-scroll h-40">
                    <p>{wave.message}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {format(
                        new Date(wave.timestamp.toString()),
                        "MMM d, yyyy"
                      )}
                    </p>
                    <div>
                      <p data-tip={wave.address}>
                        <Info className="w-4 h-4" />
                      </p>
                      <ReactTooltip place="top" type="dark" effect="float" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StyledSection>
  );
}

import React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import './App.css';
import abi from "./utils/wavePortal.json"

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);

  const contractAddress = "0x9899Ea4F3Af06ab74d44FF328bF1fDd6DE3Dedd1"

  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;


      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }


  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  const wave = async () => {
    try {

      const msgg = document.getElementById("msgInput").value

      // const msgToBeSent =msgInpDiv.value
      // console.log(msgInpDiv.value)
      // setMessage(msgToBeSent)
      // console.log(message, "msss")

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(msgg, { gasLimit: 300000 })
        console.log("Mining...", waveTxn.hash);



        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const getAllWaves = async () => {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          /*
           * Call the getAllWaves method from your Smart Contract
           */
          const waves = await wavePortalContract.getAllWaves();


          /*
           * We only need address, timestamp, and message in our UI so let's
           * pick those out
           */
          let wavesCleaned = [];
          waves.forEach(wave => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            });
          });

          setAllWaves(wavesCleaned);
        } else {
          console.log("Ethereum object doesn't exist!")
        }
      } catch (error) {
        console.log(error);
      }
    }
    getAllWaves()

  }, [allWaves])



  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          Hey there! Sayuri here.
        </div>

        <div className="bio">
          I am young girl having tech passion. <br />  As a kid I used to build robots🤖 out of cardboard boxes 📦 & as a teenager I build project over internet 💻.
        </div>

        <div className="waverDiv">
          <h2>Drop a cool message, cool people</h2>
          <textarea id="msgInput">

          </textarea>
          <button className="waveButton" onClick={wave}>👋 Here!
        </button>

        </div>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className="allMsgDivs">
          {allWaves.map((wave, index) => {
            return (
              <div className="msgDiv" key={index} >
                <div className="msgBold"> <p>✉️ :      {wave.message}</p></div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Address: {wave.address}</div>



              </div>)
          })}
        </div>
      </div>

    </div>
  );
}

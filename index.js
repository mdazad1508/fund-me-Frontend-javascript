import { ethers } from "./ethers-5.6.esm.min.js";
import { contractAddress, abi } from "./constants.js";

const connectBtn = document.getElementById("btn");
connectBtn.addEventListener("click", connect);

const fundBtn = document.getElementById("fund");
fundBtn.addEventListener("click", fund);

const wthBtn = document.getElementById("wthBtn");
wthBtn.addEventListener("click", withdraw);

const balanceBtn = document.getElementById("getBalance");
balanceBtn.addEventListener("click", getBalance);

async function connect() {
  if (typeof window.ethereum != "undefined") {
    console.log("metamask detected");
    if (
      (await window.ethereum.request({ method: "eth_accounts" })).length == 0
    ) {
      connectBtn.innerHTML = "connecting to metamask...";
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      connectBtn.innerHTML = "connected";
    } catch (err) {
      console.log(err);
    }

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    console.log("please install metamask");
    connectBtn.innerHTML = "please install metamask";
  }
}

async function fund() {
  const ethAmount = await ethers.utils.parseEther(
    document.getElementById("fundInput").value || "0"
  );
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    console.log(`current balacne of contract : ${balance}`);
    try {
      const txnResponse = await contract.fund({ value: ethAmount });
      await waitForTransactionMine(txnResponse, provider);
      getBalance();
      console.log(`transaction of ${ethAmount} successfulll`);
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("please install metamask");
    fundBtn.innerHTML = "please install metamask";
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("withdrawing......");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await waitForTransactionMine(transactionResponse, provider);
      getBalance();
    } catch (e) {
      console.log(e);
    }
  } else {
    fundBtn.innerHTML = "Please install MetaMask";
  }
}

const waitForTransactionMine = (transactionResponse, provider) => {
  console.log(`mining ${transactionResponse.hash} ....`);

  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReciept) => {
        console.log(
          `completed with ${transactionReciept.confirmations} block confirmations`
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

async function getBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const balance = await provider.getBalance(contractAddress);
  const balanceInEth = ethers.utils.formatEther(balance);
  console.log(balanceInEth);
  document.getElementById(
    "balance"
  ).innerHTML = `Current Contract Balance : ${balanceInEth} `;
}

<template>
  <div class="w-full h-screen absolute text-center flex justify-center items-center">
    
      <div class="grid grid-cols-3 gap-4 text-gray-400">
<button  id="connectButton" class="hover:border-indigo-600 hover:text-indigo-600 p-2 col-end-3 col-start-1 10 border border-gray-700 border-dashed rounded-lg text-sm" >METAMASK</button>
    </div>
  <div id="walletID" class="grid grid-cols-4 gap-6 text-gray-400">
<h2 >Account: </h2>
</div>
<div class="grid grid-cols-5 gap-8 text-gray-400">      
    <router-link tag="button" to="/connect" class="border border-transparent hover:border-indigo-600 hover:bg-transparent p-2 10 bg-indigo-600 text-white rounded-lg">Start</router-link>
</div>

  </div>
</template>
<script>
const connectButton = document.getElementById("connectButton");
const walletID = document.getElementById("walletID");

if (typeof window.ethereum !== "undefined") {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        const account = accounts[0]
        console.log(account);
        
      })
      
} else {
      window.open("https://metamask.io/download/", "_blank");
}

const account=ethereum.selectedAddress;
export function getAccount() {
  return account;
}


</script>

_web3 = new window.Web3(new window.Web3.providers.HttpProvider("https://node-1.siricoin.tech:5006/"));

currentAddress = "";
minerActive = false;
threads = []
shares = 0;
hashrate = 0;

class Wallet {
	constructor(web3Instance) {
		this.web3Instance = web3Instance;
		this.miningAccount = web3Instance.eth.accounts.privateKeyToAccount(web3Instance.utils.soliditySha3((Math.random()*10**17).toFixed()));
	}
	
	convertFromHex(hex) {
		var hex = hex.toString();//force conversion
		var str = '';
		for (var i = 0; i < hex.length; i += 2)
			str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
		return str;
	}

	convertToHex(str) {
		var hex = '';
		for(var i=0;i<str.length;i++) {
			hex += ''+str.charCodeAt(i).toString(16);
		}
		return hex;
	}
	
	async getAccountInfo(account) {
		return (await (await fetch(`https://node-1.siricoin.tech:5006/accounts/accountInfo/${account}`)).json()).result;
	}

	async getHeadTx(account) {
		let accountInfo = (await getAccountInfo(account));
		return accountInfo.transactions[accountInfo.transactions.length-1];
	}

	async buildTransaction(to, tokens) {
		const account = (await this.web3Instance.eth.getAccounts())[0];
		const parent = (await getHeadTx(account));
		let data = {"from":account, "to":this.web3Instance.utils.toChecksumAddress(to), "tokens":tokens, "parent": parent, "type": 0};
		let strdata = JSON.stringify(data);
		const hash = this.web3Instance.utils.soliditySha3(strdata);
		const signature = await this.web3Instance.eth.personal.sign(strdata, account);
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}
	
	async buildMiningTransaction(submittedBlock) {
		const account = (await this.web3Instance.eth.getAccounts())[0];
		const parent = (await getHeadTx(this.miningAccount.address));
		let data = {"from":this.miningAccount.address, "to":this.miningAccount.address, "tokens":0, "blockData": submittedBlock, "parent": parent, "type": 1};
		let strdata = JSON.stringify(data);
		const hash = this.web3Instance.utils.soliditySha3(strdata);
		const signature = await this.miningAccount.sign(strdata).signature;
		const tx = {"data": data, "sig": signature, "hash": hash, "nodeSigs": {}};
		return this.convertToHex(JSON.stringify(tx));
	}

	async sendTransaction(signedTx) {
		console.log(signedTx);
		return (await (await fetch(`https://node-1.siricoin.tech:5006/send/rawtransaction/?tx=${signedTx}`)).json()).result;
	}
	
	getVrs(sig) {
		return (('0x' + sig.substring(2).substring(128, 130)), ('0x' + sig.substring(2).substring(0, 64)), ('0x' + sig.substring(2).substring(64, 128)))
	}
}

wallet = new Wallet(_web3);
lastBalanceRefresh = 0;

var formatHashrate = function(rate) {
    rate = parseFloat(rate); unit = 'H/s';
    if(rate >= 1000) { rate /= 1000; unit= 'KH/s'; }
    if(rate >= 1000) { rate /= 1000; unit= 'MH/s'; }
    if(rate >= 1000) { rate /= 1000; unit= 'GH/s'; }
    if(rate >= 1000) { rate /= 1000; unit= 'TH/s'; }
    if(rate >= 1000) { rate /= 1000; unit= 'PH/s'; }
    return (rate.toFixed(2) + ' ' + unit);
  }

function threadsStatus(threadNumber, data) {
	threads[threadNumber].shares = Number(data.split(",")[0]);
	threads[threadNumber].hashrate = Number(data.split(",")[1]);
	i = 0;
	hashrate = 0;
	shares = 0;
	while (i < threads.length) {
		hashrate += threads[i].hashrate;
		shares += threads[i].shares;
		i += 1;
	}

	setMinerStatus(`running - ${shares} shares accepted - ${formatHashrate(hashrate)} <br/>Number of threads : ${threads.length}`);
	if (Number(data.split(",")[2]) == 1) {
		refreshBalance();
	}
}

function setMinerStatus(status) {
	document.getElementById("miningstatus").innerHTML = status;
}

async function refreshBalance() {
	document.getElementById("currentbalance").innerHTML = Math.round((await wallet.getAccountInfo(currentAddress)).balance) + " SiriCoin";
}

async function formatAddress(_address_) {
	splitted = _address_.split(".")
	if (splitted[splitted.length-1] === "eth") {
		return (await (new Web3("https://cloudflare-eth.com/")).eth.ens.getAddress(_address_));
	}
	else {
		return Web3.utils.toChecksumAddress(_address_);
	}
}

async function startMining(_address, _threads) {
	try {
		currentAddress = (await formatAddress(_address));
		refreshBalance();	
		if (!minerActive) {
			if (typeof Worker !== "undefined") {
				minerActive = true;
				i = 0;
				while (i < (_threads || navigator.hardwareConcurrency)) {
					threads[i] = new Worker("assets/js/miningWorker.js");
					threads[i].threadNumber = i;
					threads[i].onmessage = function(event) {
						threadsStatus(event.target.threadNumber, event.data);
					};
					// ref = getReferralStuff();
					// if (ref) {
						// threads[i].postMessage(_address + "," + ref);
					// }
					// else {
						// threads[i].postMessage(_address);
					// }
					threads[i].postMessage(currentAddress);
					i += 1;
				}
			}
			else {
				setMinerStatus("Error: Webminer cannot run on this browser. (error.javascript.exec.failed)");
			}
		}
	}
	catch (e) {
		setMinerStatus(e)
	}
}

function stopMining() {
	i = 0;
	while (i < threads.length) {
		threads[i].terminate();
		threads[i].hashrate = 0;
		threads[i].shares = 0;
		i += 1;
	}
	threads = []
	minerActive = false;
	setMinerStatus("Not running..");
}

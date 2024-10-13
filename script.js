const connectWalletButton = document.getElementById('connectWallet');
const walletAddressElement = document.getElementById('walletAddress').querySelector('span');
const checkerDiv = document.getElementById('checker');
const checkAllowanceButton = document.getElementById('checkAllowance');
const resultElement = document.getElementById('result').querySelector('span');

let web3;
let userAccount;

// ABI для стандарта ERC20 (только необходимые части)
const minABI = [
    // balanceOf
    {
        "constant":true,
        "inputs":[{"name":"_owner","type":"address"}],
        "name":"balanceOf",
        "outputs":[{"name":"balance","type":"uint256"}],
        "type":"function"
    },
    // allowance
    {
        "constant":true,
        "inputs":[
            {"name":"_owner","type":"address"},
            {"name":"_spender","type":"address"}
        ],
        "name":"allowance",
        "outputs":[{"name":"remaining","type":"uint256"}],
        "type":"function"
    },
];

if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
    console.log('MetaMask is installed!');
} else {
    alert('Please install MetaMask to use this dApp!');
}

connectWalletButton.addEventListener('click', async () => {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];
        walletAddressElement.textContent = userAccount;
        checkerDiv.style.display = 'block';
    } catch (error) {
        console.error('Error connecting to wallet:', error);
    }
});

checkAllowanceButton.addEventListener('click', async () => {
    const tokenAddress = document.getElementById('tokenAddress').value;
    const spenderAddress = document.getElementById('spenderAddress').value;

    if (!web3.utils.isAddress(tokenAddress) || !web3.utils.isAddress(spenderAddress)) {
        alert('Please enter valid Ethereum addresses.');
        return;
    }

    const tokenContract = new web3.eth.Contract(minABI, tokenAddress);

    try {
        const allowance = await tokenContract.methods.allowance(userAccount, spenderAddress).call();
        const decimals = await getTokenDecimals(tokenContract);
        const adjustedAllowance = allowance / (10 ** decimals);

        resultElement.textContent = adjustedAllowance;
    } catch (error) {
        console.error('Error fetching allowance:', error);
        alert('Failed to fetch allowance. Please check the addresses and try again.');
    }
});

// Функция для получения количества десятичных знаков токена
async function getTokenDecimals(tokenContract) {
    const decimals = await tokenContract.methods.decimals().call();
    return decimals;
}

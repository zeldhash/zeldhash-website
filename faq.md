# ZeldWallet FAQ

## General

**1. Are my cryptocurrencies really safe in this wallet? Where are my private keys stored?**

Yes, your funds are as safe as your browser's security. ZeldWallet stores your private keys locally in your browser's IndexedDB, encrypted with AES-256-GCM. If you set a password, your keys are protected using PBKDF2 key derivation, making them extremely difficult to crack. Your private keys never leave your device and are never sent to any server. However, always create a backup of your mnemonic phrase — if you lose access to your browser or device without a backup, your funds will be lost forever.

**2. What's the difference between the "Payment" address and the "Ordinals" address?**

The **Payment address** is used for regular Bitcoin transactions — sending and receiving BTC. The **Ordinals address** (a Taproot address) is where your ZELD tokens are received when you successfully hunt a rare transaction. ZELD tokens attach to the first output of the transaction, which is always sent to your Ordinals address.

**3. Why do I have two different Bitcoin addresses?**

This follows Bitcoin best practices for separating different asset types. The Payment address handles your BTC for paying transaction fees, while the Ordinals address receives and holds your ZELD tokens. This separation prevents accidentally spending UTXOs that contain ZELD when making regular BTC payments.

**4. Can I use ZeldWallet on my phone?**

Yes, ZeldWallet works in any modern mobile browser. However, mining performance on mobile devices is significantly lower than on desktop computers due to limited CPU power and the lack of GPU acceleration. For serious hunting, a desktop or laptop computer is recommended.

## Minting / Hunting

**5. What's the difference between mining with or without GPU? Will it damage my computer?**

GPU mining uses WebGPU technology to leverage your graphics card for much faster hash calculations — typically 10-100x faster than CPU-only mining. CPU mining uses Web Workers and is slower but works on all devices. Neither will damage your computer. Modern hardware is designed to handle sustained workloads. Your browser manages resources responsibly, and you can stop mining at any time.

**6. How long does it take to mine a ZELD?**

It depends on your hardware and luck. Finding a transaction hash with 6 leading zeros has roughly a 1 in 16 million chance per attempt. With a modern GPU achieving millions of hashes per second, it might take minutes to hours. With CPU-only, it could take hours to days. There's also randomness involved — you might get lucky quickly or it might take longer than average.

**7. Do I need to keep my computer running during mining?**

Yes. Mining happens in your browser, so the tab must remain open and active. If you close the browser or navigate away, mining stops. Your progress (hashes processed) is not saved — you'll start fresh when you resume. However, no funds are at risk if you stop mid-mining; the transaction is only broadcast once a valid hash is found and signed.

## Transactions and Fees

**8. How do I choose transaction fees? What's the difference between "Slow", "Medium", and "Fast"?**

ZeldWallet fetches real-time fee recommendations from mempool.space:
- **Slow**: Lower fee, may take 1+ hours to confirm
- **Medium**: Balanced fee, typically confirms within 30-60 minutes
- **Fast**: Higher fee, usually confirms in the next 1-2 blocks (~10-20 minutes)

You can also set a custom fee rate in sats/vB. Higher fees mean faster confirmation but cost more BTC.

**9. Why am I required to have a minimum amount of BTC to start mining?**

Every Bitcoin transaction requires a fee, and each output needs a minimum value (called "dust limit"). ZeldWallet requires approximately 2,000+ satoshis to cover:
- **330 sats**: Dust amount for the ZELD output to your Ordinals address
- **~1,500+ sats**: Transaction fee depending on current network conditions

Without sufficient BTC, you can't create a valid transaction.

**10. How do I send ZELD to someone else?**

In ZeldWallet, go to the Hunt section and check "Send ZELD". Enter the recipient's Bitcoin address and the amount of ZELD you want to send. The transfer will be included in your next hunt transaction — your ZELD will be sent when the rare hash is found and the transaction is broadcast.

**11. I just sent ZELD but my balance increased!?**

That's normal — and great news! When you send ZELD through ZeldWallet, you're not just making a transfer, you're also hunting for a rare transaction hash. If the transaction you broadcast has 6 or more leading zeros, you earn a ZELD reward (up to 4,096 ZELD for the rarest finds). So if you sent 100 ZELD but received a 256 ZELD reward, your net balance actually went up by 156 ZELD. Every transaction is an opportunity to earn!

**12. What happens if I close my browser during a transaction?**

If you close during **mining**: Nothing is lost. Mining simply stops and you can restart later.

If you close during **signing/broadcast**: If the transaction was already signed and broadcast to the network, it will confirm normally. If it wasn't broadcast yet, nothing was sent and you'll need to mine again.

## Security and Backup

**13. What is a backup and why is it so important to create one?**

A backup is your 12 or 24-word mnemonic phrase (seed phrase). This phrase can regenerate all your private keys and recover your entire wallet on any device or compatible wallet application. **Without this backup, if you lose access to your browser (cleared data, new device, browser crash), your funds are permanently lost.** Write it down on paper and store it securely — never save it digitally or share it with anyone.

**14. If I forget my password, do I lose everything?**

No, **if you have your backup mnemonic phrase**. You can clear ZeldWallet's storage and restore your wallet using the mnemonic. The password only protects the local encrypted storage — it's not tied to the blockchain. However, if you forget your password AND don't have your mnemonic backup, then yes, your funds are lost.

**15. What is a "mnemonic phrase" and can I restore my wallet from another application?**

A mnemonic phrase (also called seed phrase or recovery phrase) is a list of 12 or 24 words that represents your master private key according to the BIP39 standard. Yes, you can restore a ZeldWallet mnemonic in other compatible wallets like Xverse, Leather, Sparrow, or any BIP39/BIP84/BIP86 compatible wallet. Your Bitcoin and ZELD will appear at the same addresses.

**16. Can someone access my wallet if I lose my computer?**

It depends on your security setup. If you set a strong password, an attacker would need to crack the encryption (very difficult with a good password). Without a password, someone with access to your browser's data could potentially access your wallet. For maximum security: always use a strong password, and if your device is lost/stolen, restore your wallet elsewhere using your mnemonic and transfer your funds immediately.

## External Wallets

**17. Can I connect my Xverse or Leather wallet instead of creating a new account?**

Yes! ZeldWallet supports connecting external wallets including Xverse, Leather, and Magic Eden. Click "Connect Wallet" and choose your installed wallet. Your wallet extension will prompt you to approve the connection. This lets you hunt for ZELD using your existing wallet's addresses without exposing your private keys to ZeldWallet.

**18. What's the difference between using ZeldWallet directly or through an external wallet like Xverse?**

| Feature | ZeldWallet Direct | External Wallet (Xverse, etc.) |
|---------|-------------------|-------------------------------|
| **Key storage** | Encrypted in browser | In the extension/hardware |
| **Setup** | Create or restore in-browser | Connect existing wallet |
| **Signing** | Automatic (after unlock) | Approval popup for each action |
| **Portability** | Tied to browser/device | Works across sites |
| **Hardware wallet** | Not supported | Supported (via extension) |

Use an external wallet if you want hardware wallet support, already have funds there, or prefer keeping keys in a dedicated extension. Use ZeldWallet directly for a simpler, all-in-one experience.

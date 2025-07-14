import React, { useState } from "react";
import { encrypt } from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import { keccak256, getBytes, Signature, BrowserProvider } from "ethers";

export default function EncryptAndSignSeparate() {
  const [message, setMessage] = useState("");
  const [ciphertextHex, setCiphertextHex] = useState("");
  const [hashHex, setHashHex] = useState("");
  const [hashDec, setHashDec] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const [pubKeyBase64, setPubKeyBase64] = useState("");
  const [pubKeyHex, setPubKeyHex] = useState("");

  const ensureEthereum = () => {
    if (!window.ethereum) {
      throw new Error("MetaMask non rilevato: installa MetaMask per continuare.");
    }
  };

  const requestAccount = async () => {
    ensureEthereum();
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    return accounts[0];
  };

  const base64ToHex = (base64) => {
    const buffer = Buffer.from(base64, "base64");
    return "0x" + buffer.toString("hex");
  };

  const handleEncrypt = async () => {
    setError("");
    setResults(null);
    try {
      ensureEthereum();
      const address = await requestAccount();
      const publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [address],
      });

      // Salva la chiave pubblica in base64 e hex
      setPubKeyBase64(publicKey);
      setPubKeyHex(base64ToHex(publicKey));

      const encryptedObject = encrypt({
        publicKey,
        data: message,
        version: "x25519-xsalsa20-poly1305",
      });

      const ciphertextBase64 = encryptedObject.ciphertext;
      const hex = Buffer.from(ciphertextBase64, "base64").toString("hex");

      const ciphertextBytes = Buffer.from(hex, "hex");
      const hash = keccak256(ciphertextBytes);
      const hashBigInt = BigInt(hash);

      setCiphertextHex(hex);
      setHashHex(hash);
      setHashDec(hashBigInt.toString());
    } catch (err) {
      setError(err.message || "Errore durante la cifratura");
    }
  };

  const handleSign = async () => {
    setError("");
    try {
      ensureEthereum();
      const address = await requestAccount();
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const flatSig = await signer.signMessage(getBytes(hashHex));
      const sigObj = Signature.from(flatSig);

      setResults({
        signature: flatSig,
        v: sigObj.v,
        r: sigObj.r,
        s: sigObj.s,
        betaAddress: address,
      });
    } catch (err) {
      setError(err.message || "Errore durante la firma");
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h2>Cifra e Firma un Messaggio</h2>

      <textarea
        placeholder="Scrivi un messaggio"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={handleEncrypt} style={{ marginBottom: "1rem" }}>
        Cifra messaggio per B
      </button>

      {pubKeyBase64 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Chiave pubblica di cifratura</h3>
          <p><strong>Base64:</strong> {pubKeyBase64}</p>
          <p><strong>Hex:</strong> {pubKeyHex}</p>
        </div>
      )}

      {ciphertextHex && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Dati Cifrati</h3>
          <p><strong>Messaggio cifrato (hex):</strong></p>
          <textarea
            readOnly
            value={"0x" + ciphertextHex}
            style={{ width: "100%", height: "80px" }}
          />
          <p><strong>Hash (hex):</strong> {hashHex}</p>
          <p><strong>Hash (decimale):</strong> {hashDec}</p>

          <button onClick={handleSign} style={{ marginTop: "1rem" }}>
            Firma con Beta (relay)
          </button>
        </div>
      )}

      {results && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Firma</h3>
          <ul>
            <li><code>v:</code> {results.v}</li>
            <li><code>r:</code> {results.r}</li>
            <li><code>s:</code> {results.s}</li>
            <li><code>Beta address:</code> {results.betaAddress}</li>
          </ul>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

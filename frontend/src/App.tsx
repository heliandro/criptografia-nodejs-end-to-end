import React, { useState } from 'react';
import axios from 'axios';
import JSEncrypt from 'jsencrypt';

function App() {
  const [data, setData] = useState('');
  const [encryptedData, setEncryptedData] = useState<any | undefined>();
  const [transferResult, setTransferResult] = useState('');

  const encryptData = async () => {
    try {
      const publicKeyResponse = await axios.get('http://localhost:3001/cryptokeys');
      const {publicKey} = publicKeyResponse.data;

      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);

      const messageEncrypted = encrypt.encrypt(data);
      // console.log('encrypte::', messageEncrypted)

      // const decrypt = new JSEncrypt()
      // decrypt.setPrivateKey(privateKey)

      // const messageDecrypted = decrypt.decrypt(messageEncrypted.toString());
      // console.log('decrypte:::', messageDecrypted)

      setEncryptedData(messageEncrypted);
    } catch (error) {
      console.error('Error encrypting data:', error);
    }
  };

  const sendEncryptedData = async () => {
    try {
      if (!encryptedData) {
        console.error('No encrypted data available.');
        return;
      }
      
      // const decrypt = new JSEncrypt();
      // de

      const response = await axios.post('http://localhost:3001/transfer', {
        messageEncrypted: encryptedData
      });

      setTransferResult(response.data.decryptedMessage);
    } catch (error) {
      console.error('Error sending encrypted data:', error);
    }
  };

  return (
    <div>
      <h1>End-to-End Encryption Example</h1>
      <textarea
        value={data}
        onChange={(e) => setData(e.target.value)}
        placeholder="Enter data to encrypt"
      />
      <button onClick={encryptData}>Encrypt</button>
      <div>
        <h2>Encrypted Data</h2>
        <textarea value={encryptedData ? encryptedData : ''} readOnly />
      </div>
      <button onClick={sendEncryptedData}>Send Encrypted Data</button>
      <div>
        <h2>Transfer Result</h2>
        <p>{transferResult}</p>
      </div>
    </div>
  );
}

export default App;

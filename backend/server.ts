import fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


const generateCryptoKeys = () => {
  const publicKeyPath = './keys/public_key.pem';
  const privateKeyPath = './keys/private_key.pem';

  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    console.log('Chaves não encontradas. Gerando novas chaves...');

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey);

    console.log('Chaves geradas e salvas com sucesso.');
  }
}


// Rota para obter a chave pública
app.get('/cryptokeys', (req, res) => {
  if (!fs.existsSync('./keys/public_key.pem')) {
    generateCryptoKeys();
  }

  let publicKey = fs.readFileSync('./keys/public_key.pem', 'utf8');
  // let privateKey = fs.readFileSync('./keys/private_key.pem', 'utf8');

  res.json({ publicKey });
});

app.post('/encrypt', (req, res) => {
  const data = req.body.data;

  const publicKey = fs.readFileSync('./keys/public_key.pem', 'utf8');

  const messageEncrypted = crypto.publicEncrypt(publicKey, Buffer.from(data))

  res.json({ messageEncrypted })
})

app.post('/decrypt', (req, res) => {

  const messageEncrypted = Buffer.from(req.body.messageEncrypted, 'base64')

  const privateKey = fs.readFileSync('./keys/private_key.pem', 'utf8');

  const decryptedBuffer = crypto.privateDecrypt(
    privateKey,
    messageEncrypted
  )

  const decryptedMessage = decryptedBuffer.toString()
  res.json({ decryptedMessage })
})

// Rota para receber dados criptografados e concluir a transação
app.post('/transfer', (req, res) => {
  try {

    console.log('\n param::: ' + req.body.messageEncrypted + '\n\n');

    const messageEncrypted = Buffer.from(req.body.messageEncrypted, 'base64');

    console.log('\n buffer::: ' + messageEncrypted + '\n\n');
    
    const serverPrivateKey = fs.readFileSync('./keys/private_key.pem', 'utf8');
    
    const decryptedBuffer = crypto.privateDecrypt({
      key: serverPrivateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }, messageEncrypted);

    console.log(decryptedBuffer.toString());

    const transferResult = 'Transferência de Pix concluída com sucesso';
    res.json({ decryptedMessage: decryptedBuffer.toString() });
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({ message: 'Erro ao processar a transferência' });
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

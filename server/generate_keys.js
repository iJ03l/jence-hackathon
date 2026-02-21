const crypto = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'P-256',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const envPath = '/home/x-5194/Downloads/jence/server/.env';
let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

envContent = envContent.replace(/^PRIVY_CUSTOM_AUTH_KEY=.*[\r\n]*/gm, '');
envContent += `\nPRIVY_CUSTOM_AUTH_KEY="${privateKey.replace(/\n/g, '\\n')}"\n`;

fs.writeFileSync(envPath, envContent);

console.log(publicKey);

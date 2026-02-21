import { importPKCS8, SignJWT } from 'jose'

async function tryImport(secret: string) {
    // A Privy secret usually needs to be formatted as a valid PEM block if it isn't already.
    // If it's just a base64 string, we must wrap it.
    let formattedSecret = secret;
    if (!secret.includes('-----BEGIN PRIVATE KEY-----')) {
        formattedSecret = `-----BEGIN PRIVATE KEY-----\n${secret}\n-----END PRIVATE KEY-----`;
    }

    console.log('Testing Secret formats');
    try {
        const key = await importPKCS8(formattedSecret, 'ES256')
        console.log('Success PKCS8');
    } catch (e: any) {
        console.log('Failed PKCS8:', e.message);
    }
}

// Generate a dummy valid ES256 key for testing the parser
import crypto from 'crypto';
const { privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'P-256',
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const rawBase64 = privateKey.replace('-----BEGIN PRIVATE KEY-----\n', '').replace('\n-----END PRIVATE KEY-----\n', '');
tryImport(rawBase64);

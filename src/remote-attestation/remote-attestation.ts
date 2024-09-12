import { chainCerts, ChainCert } from './chain-certs';
import * as cbor from 'cbor-web';

import { Certificate, PrivateKey } from '@sardinefish/x509';

export interface RemoteAttestation {
  protected: string;
  payload: string;
  signature: string;
  certificate: string;
}

export interface Payload {
  module_id: string;
  timestamp: number;
  digest: string;
  pcrs: Uint8Array[];
  certificate: Uint8Array;
  cabundle: Uint8Array[];
  public_key: Buffer;
  user_data: Uint8Array | null;
  nonce: Uint8Array | null;
}

//@todo chaincerts is harcoded rn but can be extracted from remote attestation cabundle actually.
//Only the root CA should be saved or downloaded from aws.
export function verifyx509Certificate(certificateBytes: Uint8Array) {
  // Add PEM begin and end lines

  const pemCertificate = Buffer.concat([
    Buffer.from(`-----BEGIN CERTIFICATE-----
${Buffer.from(certificateBytes).toString('base64')}
-----END CERTIFICATE-----`),
  ]);
  // Parse the certificate
  let cert = Certificate.fromPEM(pemCertificate);
  for (let i = 0; i < chainCerts.length - 1; i++) {
    const issuer = Certificate.fromPEM(Buffer.from(chainCerts[i].Cert));
    if (issuer.checkSignature(cert) !== null) {
      return false;
    }
    cert = issuer;
  }
  return true;
}

export function decodeCbor(base64string: string): RemoteAttestation | null {
  const data = Buffer.from(base64string, 'base64');
  try {
    const decoded = cbor.decodeAllSync(data);

    const remoteAttestation: RemoteAttestation = {
      protected: Buffer.from(decoded[0][0]).toString('base64'),
      payload: Buffer.from(decoded[0][2]).toString('base64'),
      signature: Buffer.from(decoded[0][3]).toString('base64'),
    };
    return remoteAttestation;
  } catch (e: any) {
    console.log('Error decoding CBOR attestation', e.toString());
    return null;
  }
}

export function decodeCborPayload(base64string: string) {
  const data = Buffer.from(base64string, 'base64');
  try {
    const decoded = cbor.decodeAllSync(data);
    const payload = decoded[0] as Payload;
    return payload;
  } catch (e: any) {
    console.log('Error decoding CBOR payload', e.toString());
    return undefined;
  }
}

export function decodeCborAll(base64string: string) {
  const remoteAttestation = decodeCbor(base64string);
  if (!remoteAttestation) return;
  const payload = decodeCborPayload(remoteAttestation.payload);
  if (!payload) return;
  return {
    protected: remoteAttestation.protected,
    payload: remoteAttestation.payload,
    signature: remoteAttestation.signature,
    certificate: Buffer.from(payload.certificate).toString('base64'),
  };
}

export function uint8ArrayToBase64(uint8Array: Uint8Array) {
  return Buffer.from(uint8Array).toString('base64');
}

// async function verifyRemoteAttestation() {
//   //fetch attestation
//   // add axios code here..

//   //parse cbor structure
//   const base64String = fs.readFileSync('./remote_attestation', 'utf8');
//   const remote_attestation_uint8 = Buffer.from(base64String, 'base64');
//   const remote_attestation = decodeCbor(remote_attestation_uint8);

//   if (!remote_attestation) return;

//   const payload = decodeCborPayload(remote_attestation.payload);
//   // console.log(payload);

//   if (!payload) return;

//   //verify signature of attestation
//   const cert = new crypto.X509Certificate(payload.certificate);
//   //console.log('payload.certificate', new Uint8Array(payload.certificate));

//   //@todo verify signature by calling wasm
//   console.log('payload', remote_attestation.payload);
//   console.log('signature', remote_attestation.signature);
//   console.log('protected', remote_attestation.protected);
//   console.log('payload.certificate', new Uint8Array(payload.certificate));

//   fs.writeFileSync(
//     './out/certificate',
//     uint8ArrayToBase64(payload.certificate),
//   );
//   fs.writeFileSync(
//     './out/signature',
//     uint8ArrayToBase64(remote_attestation.signature),
//   );
//   fs.writeFileSync(
//     './out/protected',
//     uint8ArrayToBase64(remote_attestation.protected),
//   );

//   //@todo verify PCR values

//   //@todo verify nonce
// }

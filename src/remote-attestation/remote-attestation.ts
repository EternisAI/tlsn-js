import { chainCerts, ChainCert } from './chain-certs';
import * as cbor from 'cbor-web';

import { Certificate, PrivateKey } from '@sardinefish/x509';

export interface RemoteAttestation {
  protected: string;
  payload: string;
  signature: string;
  certificate: string;
  payload_object: Payload;
}

export interface Payload {
  module_id: string;
  timestamp: number;
  digest: string;
  pcrs: Map<number, string>;
  certificate: Uint8Array;
  cabundle: Uint8Array[];
  public_key: Buffer;
  user_data: Uint8Array | null;
  nonce: string | null;
}

export function decodeCbor(base64string: string) {
  const data = Buffer.from(base64string, 'base64');
  try {
    const decoded = cbor.decodeAllSync(data);

    const remoteAttestation = {
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
    const payload = decoded[0];

    const pcrs: Map<string, Uint8Array> = payload.pcrs;
    const stringMap: Map<string, string> = new Map();
    pcrs.forEach((value, key) => {
      stringMap.set(key, Buffer.from(value).toString('base64'));
    });
    payload.pcrs = stringMap;
    payload.nonce = Buffer.from(payload.nonce).toString('hex');

    return payload as Payload;
  } catch (e: any) {
    console.log('Error decoding CBOR payload', e.toString());
    return undefined;
  }
}

/**
 * Decode CBOR document and parse remote attestation fields
 * @returns {RemoteAttestation} The generated nonce.
 */

export function decodeCborAll(
  base64string: string,
): RemoteAttestation | undefined {
  const remoteAttestation = decodeCbor(base64string);
  if (!remoteAttestation) return;
  const payload = decodeCborPayload(remoteAttestation.payload);
  if (!payload) return;
  return {
    protected: remoteAttestation.protected,
    payload: remoteAttestation.payload,
    signature: remoteAttestation.signature,
    certificate: Buffer.from(payload.certificate).toString('base64'),
    payload_object: payload,
  };
}

/**
 * It generates a random nonce of length 40 using hexadecimal characters.
 * This nonce is used to ensure the uniqueness of the attestation.
 * @returns {string} The generated nonce.
 */

export function generateNonce() {
  return Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
}

export function uint8ArrayToBase64(uint8Array: Uint8Array) {
  return Buffer.from(uint8Array).toString('base64');
}

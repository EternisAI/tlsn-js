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

import * as Comlink from 'comlink';
import init, { Prover, SignedSession, TlsProof } from 'tlsn-js';

Comlink.expose({
  init,
  Prover,
  SignedSession,
  TlsProof,
});

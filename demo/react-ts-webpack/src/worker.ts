import * as Comlink from 'comlink';
import init, { Prover, SignedSession } from 'tlsn-js';

Comlink.expose({
  init,
  Prover,
  SignedSession,
});

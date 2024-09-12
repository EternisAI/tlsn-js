import * as Comlink from 'comlink';
import init, {
  Prover,
  SignedSession,
  verify_attestation_document_2,
} from 'tlsn-js';

Comlink.expose({
  init,
  Prover,
  SignedSession,
  verify_attestation_document_2,
});

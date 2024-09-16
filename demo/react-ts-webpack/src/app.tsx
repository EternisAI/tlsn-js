import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Comlink from 'comlink';
import { Watch } from 'react-loader-spinner';
import {
  Prover as TProver,
  SignedSession as TSignedSession,
  NotaryServer,
  ProofData,
  decodeCborAll,
  RemoteAttestation,
} from 'tlsn-js';
import { requests } from './requests';
const { init, Prover, SignedSession, TlsProof, verify_attestation }: any =
  Comlink.wrap(new Worker(new URL('./worker.ts', import.meta.url)));

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);

const remote_attestation_encoded =
  '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';

function App(): ReactElement {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultVerify, setResultVerify] = useState<boolean | null>(null);
  const [proofHex, setProofHex] = useState<null | string>(null);
  const [remoteAttestation, setRemoteAttestation] =
    useState<null | RemoteAttestation>(null);
  const { dns, headers, method, url, body } = requests['swapi'];

  const [error, setError] = useState<null | string>(null);

  const verify_attestation_document = async () => {
    setProcessing(true);
    const remoteAttestation = decodeCborAll(remote_attestation_encoded);
    if (!remoteAttestation) return;
    setRemoteAttestation(remoteAttestation);

    console.log(remoteAttestation);
    const resultVerify = await verify_attestation(remoteAttestation);
    console.log(resultVerify);

    if (!resultVerify) {
      setError('remote attestation signature is not valid');
    }
    //verify x509 certificate
    setResultVerify(resultVerify);
    setProcessing(false);
  };
  useEffect(() => {
    const initialize = async () => {
      setRemoteAttestation(remoteAttestation);

      await init({ loggingLevel: 'Debug' });
    };

    initialize();
  }, []);
  // const onClick = useCallback(async () => {
  //   setProcessing(true);
  //   const notary = NotaryServer.from(`http://tlsn.eternis.ai:7047`);
  //   console.time('submit');
  //   await init({ loggingLevel: 'Debug' }, null);
  //   const prover = (await new Prover({
  //     serverDns: dns,
  //   })) as TProver;

  //   await prover.setup(await notary.sessionUrl());
  //   const resp = await prover.sendRequest('ws://localhost:55688', {
  //     url,
  //     method: method as any,
  //     headers,
  //     body,
  //   });

  //   console.timeEnd('submit');
  //   console.log(resp);

  //   const session = await prover.notarize();

  //   setProofHex(session.signature);
  //   setResult(session.signedSession);
  //   setProcessing(false);
  // }, [setProofHex, setProcessing]);

  // const onAltClick = useCallback(async () => {
  //   setProcessing(true);
  //   await init({ loggingLevel: 'Debug' });
  //   const proof = await Prover.notarize({
  //     id: 'test',
  //     notaryUrl: 'http://localhost:7047',
  //     websocketProxyUrl: 'ws://localhost:55688',
  //     url: 'https://swapi.dev/api/people/1',
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: {
  //       hello: 'world',
  //       one: 1,
  //     },
  //     commit: {
  //       sent: [{ start: 0, end: 50 }],
  //       recv: [{ start: 0, end: 50 }],
  //     },
  //   });

  //   setProofHex(proof);
  // }, [setProofHex, setProcessing]);

  useEffect(() => {
    (async () => {
      if (proofHex) {
        const notary = NotaryServer.from(`http://localhost:7047`);
        const notaryKey = await notary.publicKey();
        setProcessing(false);
      }
    })();
  }, [proofHex, setResult]);

  return (
    <div>
      <div>
        <button onClick={verify_attestation_document}>
          Verify attestation document
        </button>
      </div>
      <div>
        <p>
          encoded remote attestation
          <br /> {remote_attestation_encoded.slice(0, 10)}..
          {remote_attestation_encoded.slice(-10)}
        </p>

        {remoteAttestation && (
          <p>
            decoded remote attestation{' '}
            {JSON.stringify(remoteAttestation, null, 2)}{' '}
          </p>
        )}

        {resultVerify !== null && (
          <p>
            Remote attestation is{' '}
            {resultVerify ? 'valid ✅  ' : ' not valid ❌'}
          </p>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {processing && <p>Processing...</p>}
      </div>
      {/* <div>
        <button
          id="start-demo"
          onClick={!processing ? onClick : undefined}
          disabled={processing}
        >
          Start Demo (Normal config)
        </button>
      </div>
      <div>
        <button
          onClick={!processing ? onAltClick : undefined}
          disabled={processing}
        >
          Start Demo 2 (With helper method)
        </button>
      </div>
      <div>
        <b>Proof: </b>
        {!processing && !proofHex ? (
          <i>not started</i>
        ) : !proofHex ? (
          <>
            Proving data from swapi...
            <Watch
              visible={true}
              height="40"
              width="40"
              radius="48"
              color="#000000"
              ariaLabel="watch-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
            Open <i>Developer tools</i> to follow progress
          </>
        ) : (
          <>
            <div id="proof">{JSON.stringify(proofHex, null, 2)}</div>
          </>
        )}
      </div>
      <div>
        <details>
          <summary>Verification: </summary>
          {!proofHex ? (
            <i>not started</i>
          ) : !result ? (
            <i>verifying</i>
          ) : (
            <pre id="verification">{JSON.stringify(result, null, 2)}</pre>
          )}
        </details>
      </div> */}
    </div>
  );
}

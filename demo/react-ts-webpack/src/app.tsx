import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Comlink from 'comlink';
import { Watch } from 'react-loader-spinner';
import {
  Prover as TProver,
  SignedSession as TSignedSession,
  NotaryServer,
  ProofData,
} from 'tlsn-js';
import { requests } from './requests';
const {
  init,
  Prover,
  SignedSession,
  TlsProof,
  verifyAttestationDocument,
}: any = Comlink.wrap(new Worker(new URL('./worker.ts', import.meta.url)));

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);

const example_remote_attestation = {
  protected: 'oQE4Ig==',
  payload:
    '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',
  signature:
    'qE3P+ML3TW+s83KfRcpF4gFgZQXKkPGePqsxJm+R519w6QAxbNHDr8MZVykotcSojakIp5PdAUncFYDlVlcD48rE8uYjBiqY0ZJWbVFeinYdOEkwh6NllRRU6mR6oiwn',
  certificate:
    'MIICfDCCAgGgAwIBAgIQAZG6NcnRt3oAAAAAZtteJzAKBggqhkjOPQQDAzCBjjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxDzANBgNVBAoMBkFtYXpvbjEMMAoGA1UECwwDQVdTMTkwNwYDVQQDDDBpLTBiYmYxYmZlMjMyYjhjMmNlLnVzLWVhc3QtMS5hd3Mubml0cm8tZW5jbGF2ZXMwHhcNMjQwOTA2MTk1NTE2WhcNMjQwOTA2MjI1NTE5WjCBkzELMAkGA1UEBhMCVVMxEzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcMB1NlYXR0bGUxDzANBgNVBAoMBkFtYXpvbjEMMAoGA1UECwwDQVdTMT4wPAYDVQQDDDVpLTBiYmYxYmZlMjMyYjhjMmNlLWVuYzAxOTFiYTM1YzlkMWI3N2EudXMtZWFzdC0xLmF3czB2MBAGByqGSM49AgEGBSuBBAAiA2IABPc9X/JjhQd9uvK6GFlkPiNMtkZI2Iy4KL4GfzKK07JRRIh9atGEuu1ByR5I9a9jt7FEnB8FBFr0EvAdg/90KfssfDr8J5csL4Rl0W2z/HPT1BO51sERz2SCv0YK7yquOaMdMBswDAYDVR0TAQH/BAIwADALBgNVHQ8EBAMCBsAwCgYIKoZIzj0EAwMDaQAwZgIxAKNWlT+MW4B0T00Awo0qHg3sE0Wu5dfDroi8XcffUKQW+oXPlvPv2UEcKNJMzo4kfwIxALXBNhVTEkzZlYWt3kQP319Yye5cJYzyVgUf0pKE6ABCl776birkytcNtSrORfGKqA==',
};

function App(): ReactElement {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultVerify, setResultVerify] = useState<string | null>(null);
  const [proofHex, setProofHex] = useState<null | string>(null);

  const { dns, headers, method, url, body } = requests['swapi'];

  useEffect(() => {
    const initialize = async () => {
      await init({ loggingLevel: 'Debug' }, example_remote_attestation);
      console.log('WASM initialized');
    };

    initialize();
  }, []);
  const onClick = useCallback(async () => {
    setProcessing(true);
    const notary = NotaryServer.from(`http://tlsn.eternis.ai:7047`);
    console.time('submit');
    await init({ loggingLevel: 'Debug' }, example_remote_attestation);
    const prover = (await new Prover({
      serverDns: dns,
    })) as TProver;

    await prover.setup(await notary.sessionUrl());
    const resp = await prover.sendRequest('ws://localhost:55688', {
      url,
      method: method as any,
      headers,
      body,
    });

    console.timeEnd('submit');
    console.log(resp);

    const session = await prover.notarize();

    setProofHex(session.signature);
    setResult(session.signedSession);
    setProcessing(false);
  }, [setProofHex, setProcessing]);

  const onAltClick = useCallback(async () => {
    setProcessing(true);
    await init({ loggingLevel: 'Debug' });
    const proof = await Prover.notarize({
      id: 'test',
      notaryUrl: 'http://localhost:7047',
      websocketProxyUrl: 'ws://localhost:55688',
      url: 'https://swapi.dev/api/people/1',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        hello: 'world',
        one: 1,
      },
      commit: {
        sent: [{ start: 0, end: 50 }],
        recv: [{ start: 0, end: 50 }],
      },
    });

    setProofHex(proof);
  }, [setProofHex, setProcessing]);

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
      </div>
    </div>
  );
}

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
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import './app.css';

const { init, Prover, SignedSession, TlsProof, verify_attestation }: any =
  Comlink.wrap(new Worker(new URL('./worker.ts', import.meta.url)));

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);

const nonce = '0000000000000000000000000000000000000001';
const remote_attestation_encoded =
  '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';

function App(): ReactElement {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultVerify, setResultVerify] = useState<boolean | null>(null);
  const [proofHex, setProofHex] = useState<null | string>(null);
  const [remoteAttestation, setRemoteAttestation] =
    useState<null | RemoteAttestation>(null);

  const [error, setError] = useState<null | string>(null);

  const verify_attestation_document = async () => {
    setProcessing(true);
    const resultVerify = await verify_attestation(
      remote_attestation_encoded,
      nonce,
    );
    if (!resultVerify) setError('remote attestation signature is not valid');
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

  const handleRefresh = () => {
    //setVerificationResult(null);
  };

  return (
    <div>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">
            Remote Attestation Verification
          </div>
          <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
            Document Content
          </h1>
          <div className="mt-2 h-80 overflow-y-auto border border-gray-200 rounded p-4 mb-4">
            <div>
              <h2 className="text-l font-bold">encoded remote attestation</h2>
              {remote_attestation_encoded.slice(0, 10)}..
              {remote_attestation_encoded.slice(-10)}
            </div>

            {remoteAttestation && (
              <div>
                <h2>decoded remote attestation</h2>
                {JSON.stringify(remoteAttestation, null, 2)}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={verify_attestation_document}
              disabled={processing}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {processing ? (
                <>
                  <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify
                </>
              )}
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Refresh
            </button>
          </div>
          {resultVerify !== null && (
            <div
              className={`mt-4 p-4 rounded-md ${resultVerify ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              <div className="flex items-center">
                {resultVerify ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">
                  {resultVerify ? 'Document is valid' : 'Document is invalid'}
                  {!resultVerify && <p>Error: {error}</p>}
                </span>
              </div>
            </div>
          )}
        </div>
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

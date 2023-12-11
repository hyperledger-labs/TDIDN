import { Agent, HttpOutboundTransport, ConsoleLogger, LogLevel, DidsModule, Key, KeyType, TypedArrayEncoder, ConnectionsModule, CredentialsModule, ProofsModule, AutoAcceptCredential, AutoAcceptProof } from '@aries-framework/core'
import { AnonCredsModule, LegacyIndyCredentialFormatService, LegacyIndyProofFormatService, V1CredentialProtocol, V1ProofProtocol } from '@aries-framework/anoncreds'
import { IndyVdrAnonCredsRegistry, IndyVdrIndyDidRegistrar, IndyVdrIndyDidResolver, IndyVdrModule, } from '@aries-framework/indy-vdr'
import { isWalletClosed, genesisTransactions, indyDidFromNamespaceAndInitialKey, sleep } from './utils.js'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { generateKeyPairFromSeed } from '@stablelib/ed25519'
import { IndySdkModule } from '@aries-framework/indy-sdk'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'
import indySdk from 'indy-sdk'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

let indyNamespace = "pool:localtest"
let endorserDid = `did:indy:${indyNamespace}:Th7MpTaRZVRYnPiabds81Y`

async function createAgent(username, password, host, port) {
    await isWalletClosed(username, password)

    const config = {
        label: 'agent',
        walletConfig: {
            id: username,
            key: password
        },
        logger: new ConsoleLogger(LogLevel.debug),
        endpoints: [`http://${host}:${port}`],
    }

    const agent = new Agent({
        config,
        dependencies: agentDependencies,
        modules: {
            connections: new ConnectionsModule({
                autoAcceptConnections: true,
            }),
            credentials: new CredentialsModule({
                autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
                credentialProtocols: [
                    new V1CredentialProtocol({
                        indyCredentialFormat: new LegacyIndyCredentialFormatService,
                    })
                ],
            }),
            proofs: new ProofsModule({
                autoAcceptProofs: AutoAcceptProof.ContentApproved,
                proofProtocols: [
                    new V1ProofProtocol({
                        indyProofFormat: new LegacyIndyProofFormatService
                    })
                ],
            }),
            indySdk: new IndySdkModule({
                indySdk,
            }),
            indyVdr: new IndyVdrModule({
                indyVdr,
                networks: [
                    {
                        isProduction: false,
                        indyNamespace,
                        genesisTransactions: genesisTransactions(),
                        connectOnStartup: true,
                    },
                ],
            }),
            anoncreds: new AnonCredsModule({
                registries: [new IndyVdrAnonCredsRegistry()],
            }),
            dids: new DidsModule({
                registrars: [new IndyVdrIndyDidRegistrar()],
                resolvers: [new IndyVdrIndyDidResolver()],
            }),
        },
    })
    agent.registerOutboundTransport(new HttpOutboundTransport())
    agent.registerInboundTransport(new HttpInboundTransport({ port }))

    await agent.initialize()

    if (!(await agent.dids.getCreatedDids()).length) {
        if (username === "stewardWalletId" && password === "testkey0000000000000000000000000") {
            await agent.dids.import({
                did: endorserDid,
                overwrite: true,
                privateKeys: [
                    {
                        privateKey: TypedArrayEncoder.fromString("000000000000000000000000Steward1"),
                        keyType: KeyType.Ed25519,
                    },
                ],
            })
        }
        else {
            const seed = Array(32 + 1)
                .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
                .slice(0, 32)
            const keyPair = generateKeyPairFromSeed(TypedArrayEncoder.fromString(seed))
            const ed25519PublicKeyBase58 = TypedArrayEncoder.toBase58(keyPair.publicKey)
            const { did, verkey } = indyDidFromNamespaceAndInitialKey(
                indyNamespace,
                Key.fromPublicKey(keyPair.publicKey, KeyType.Ed25519)
            )
            const didCreateTobeEndorsedResult = (await agent.dids.create({
                did,
                options: {
                    endorserDid,
                    endorserMode: 'external',
                    verkey,
                    role: 'TRUST_ANCHOR',
                }
            }))
            const didState = didCreateTobeEndorsedResult.didState
            if (didState.state !== 'action' || didState.action !== 'endorseIndyTransaction') throw Error('unexpected did state')

            const resp = await axios.post(`http://steward:5000/endorseDID`, {
                nymRequest: didState.nymRequest,
            })
            const didCreateSubmitResult = await agent.dids.create({
                did: didState.did,
                options: {
                    endorserMode: 'external',
                    endorsedTransaction: {
                        nymRequest: resp.data.signedNymRequest
                    },
                },
                secret: didState.secret,
            })
            sleep(5000)
            await agent.dids.import({
                did: did,
                overwrite: true,
                privateKeys: [
                    {
                        privateKey: TypedArrayEncoder.fromString(seed),
                        keyType: KeyType.Ed25519,
                    },
                ],
            })
        }
    }

    return agent
}

export default createAgent
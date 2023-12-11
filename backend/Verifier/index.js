import { BasicMessageEventTypes, KeyType, ProofEventTypes, ProofState } from "@aries-framework/core";
import createAgent from "./CreateAgent.js";
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express from 'express'
import axios from 'axios'
import cors from 'cors'

let host = "verifier"
let port = 7300

const app = express()
app.use(bodyParser.json())
app.use(cors())

dotenv.config({ path: '../../.env' })

let state = {}

const verifierAgent = async (email, password) => {
    try {
        const agent = await createAgent(email, password, host, port)

        agent.events.on(BasicMessageEventTypes.BasicMessageStateChanged, async ({ payload }) => {
            state[payload.basicMessageRecord.connectionId] = payload.message.content
            await agent.shutdown()
        })

        agent.events.on(ProofEventTypes.ProofStateChanged, async ({ payload }) => {
            if (payload.proofRecord.state === ProofState.PresentationReceived) {
                state[payload.proofRecord.connectionId] = payload.proofRecord.isVerified ? "Verified" : "Verification failed"
            }
            else if (payload.proofRecord.state === ProofState.Done) {
                await agent.shutdown()
            }
        })

        return agent
    } catch (error) {
        console.log(error)
    }
}

app.post('/verifyDID', async (req, res) => {
    const agent = await verifierAgent("verifier", "verifier")
    let didDoc;
    try {
        didDoc = await agent.dids.resolve(req.body.did)
    } catch (error) {
        res.send({
            "status": "failed",
            "message": "DID not found"
        })
        return
    }
    const result = await agent.context.wallet.verify({
        key: {
            publicKeyBase58: didDoc.didDocument.verificationMethod[0].publicKeyBase58,
            keyType: KeyType.Ed25519,
        },
        data: Buffer.from(req.body.challange, 'base64'),
        signature: Buffer.from(decodeURIComponent(req.body.signature), 'base64')
    })
    const token = jwt.sign({ did: req.body.did }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
    if (result) {
        res.send({ status: "success", token: token })
    } else {
        res.send({
            status: "failed",
            message: "Signature verification failed"
        })
    }
    await agent.shutdown()
})

app.post('/verifySimCard', async (req, res) => {
    const agent = await verifierAgent("verifier", "verifier")
    const { outOfBandRecord, connectionRecord } = await agent.oob.receiveInvitationFromUrl(decodeURIComponent(req.body.invitationUrl))
    await agent.connections.returnWhenIsConnected(connectionRecord.id);
    let response = await axios.get(`http://issuer:5001/getCredentialDefinitionId`)
    await agent.proofs.requestProof({
        protocolVersion: "v1",
        connectionId: connectionRecord.id,
        proofFormats: {
            indy: {
                name: 'proofOfSimCard',
                version: '1.0',
                requested_attributes: {
                    "0": {
                        name: "operator",
                        restrictions: [
                            {
                                cred_def_id: response.data.credentialDefinitionId
                            },
                        ],
                    },
                },
            }
        }
    })
    state[connectionRecord.id] = "requested"
    setTimeout(async () => {
        if (state[connectionRecord.id] === "requested") {
            res.send({ message: "Timeout" })
        }
        else {
            res.send({ message: state[connectionRecord.id] })
        }
    }, 5000)
})

app.listen(5003, () => { })
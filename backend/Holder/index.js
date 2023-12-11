import { CredentialEventTypes, CredentialState, KeyType, ProofEventTypes, ProofState } from '@aries-framework/core'
import abi from './contracts/IMEI.json' assert { type: "json" }
import { isAuthenticated } from './middlewares/auth.js'
import createAgent from './CreateAgent.js'
import PrismaClient from '@prisma/client'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import express from 'express'
import bcrypt from 'bcrypt'
import cors from 'cors'
import web3 from 'web3'
import fs from 'fs'

let host = "holder"
let port = 7200

const app = express()
app.use(bodyParser.json())
app.use(cors())

const web3js = new web3(new web3.providers.HttpProvider(process.env.RPC_URL))
let contract = new web3js.eth.Contract(abi, process.env.REACT_APP_IMEI_CONTRACT_ADDRESS)
const prisma = new PrismaClient.PrismaClient()

dotenv.config({ path: '../../.env' })

const holderAgent = async (username, password) => {
    try {
        if (port === 7210) port = 7200
        else port = port + 1

        let agent = await createAgent(username, password, host, port)

        agent.events.on(
            CredentialEventTypes.CredentialStateChanged,
            async ({ payload }) => {
                if (payload.credentialRecord.state === CredentialState.OfferReceived) {
                    await agent.credentials.acceptOffer({
                        credentialRecordId: payload.credentialRecord.id,
                    });
                }
                else if (payload.credentialRecord.state === CredentialState.Done) {
                    await agent.shutdown()
                }
            }
        )

        agent.events.on(ProofEventTypes.ProofStateChanged,
            async ({ payload }) => {
                if (payload.proofRecord.state === ProofState.RequestReceived) {
                    try {
                        try {
                            await agent.proofs.acceptRequest({
                                proofRecordId: payload.proofRecord.id,
                            });
                        } catch (error) {
                            await agent.basicMessages.sendMessage(payload.proofRecord.connectionId, "Verification failed")
                            await agent.proofs.declineRequest(payload.proofRecord.id)
                        }
                        finally {
                            await agent.shutdown()
                        }
                    } catch (error) {
                        console.log(error)
                    }
                }
            })

        return agent
    } catch (error) {
        console.log(error)
    }
}

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await prisma.User.findUnique({
            where: {
                email: email.toLowerCase(),
            },
        })
        if (user == null) {
            let salt = bcrypt.genSaltSync(12)
            let password_hash = bcrypt.hashSync(password, salt)
            await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    password: password_hash,
                    name: name,
                },
            })
            const agent = await holderAgent(email, password)
            await agent.shutdown()
            return res.send({
                status: true,
                "message": "User successfully created!"
            })
        } else {
            res.send(400, {
                status: false,
                message: "User Already Exist!"
            })
        }
    } catch (error) {
        console.log(error)
        res.json(400, error)
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase(),
            }
        })

        if (user == null) {
            res.status(404).send({
                status: true,
                "message": "The user doesn't exist!"
            })
            return
        }

        if (bcrypt.compareSync(password, user.password)) {
            const accessToken = jwt.sign({ userId: user.id, email: user.email, password: password, time: Date() }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
            const refreshToken = jwt.sign({ userId: user.id, email: user.email, password: password, time: Date() }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '30d' })

            res.send({
                status: true,
                "accessToken": accessToken,
                "refreshToken": refreshToken,
                "name": user.name,
                "email": user.email,
            })
        }
        else {
            res.status(401).send({
                "message": "Incorrect password"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(401).send({
            "message": error
        })
    }
})

app.get('/sign', isAuthenticated, async (req, res) => {
    const agent = await holderAgent(req.decodedData.email, req.decodedData.password)
    let key = (await agent.dids.getCreatedDids()).filter(did => did._tags.method === "indy")[0].didDocument.verificationMethod[0]
    let challange = Buffer.from(await agent.wallet.generateNonce())
    const signature = await agent.context.wallet.sign({
        data: challange,
        key: {
            keyType: KeyType.Ed25519,
            publicKeyBase58: key.publicKeyBase58,
        }
    })
    res.send({
        did: (await agent.dids.getCreatedDids()).filter(did => did._tags.method === "indy")[0].did,
        challange: challange.toString('base64'),
        signature: encodeURIComponent(signature.toString('base64'))
    })
    await agent.shutdown()
})

app.get('/createInvitation', isAuthenticated, async (req, res) => {
    const agent = await holderAgent(req.decodedData.email, req.decodedData.password)
    let invitation = await agent.oob.createInvitation()
    res.send({ invitation: encodeURIComponent(invitation.outOfBandInvitation.toUrl({ domain: `http://${process.env.host}:${port}` })) })
})

app.get('/', isAuthenticated, async (req, res) => {
    const agent = await holderAgent(req.decodedData.email, req.decodedData.password)
    const credentials = await agent.credentials.getAll()
    let successCredentials = []
    for (let credential of credentials) {
        if (credential.state === CredentialState.Done) {
            successCredentials.push(credential.credentialAttributes)
        }
    }
    res.send(successCredentials)
    await agent.shutdown()
})

app.get('/requestIMEI', isAuthenticated, async (req, res) => {
    function imei_gen() {
        var pos;
        var str = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        var sum = 0;
        var final_digit = 0;
        var t = 0;
        var len_offset = 0;
        var len = 15;
        var issuer;

        //
        // Fill in the first two values of the string based with the specified prefix.
        // Reporting Body Identifier list: http://en.wikipedia.org/wiki/Reporting_Body_Identifier
        //

        var rbi = ["01", "10", "30", "33", "35", "44", "45", "49", "50", "51", "52", "53", "54", "86", "91", "98", "99"];
        var arr = rbi[Math.floor(Math.random() * rbi.length)].split("");
        str[0] = Number(arr[0]);
        str[1] = Number(arr[1]);
        pos = 2;

        //
        // Fill all the remaining numbers except for the last one with random values.
        //

        while (pos < len - 1) {
            str[pos++] = Math.floor(Math.random() * 10) % 10;
        }

        //
        // Calculate the Luhn checksum of the values thus far.
        //

        len_offset = (len + 1) % 2;
        for (pos = 0; pos < len - 1; pos++) {
            if ((pos + len_offset) % 2) {
                t = str[pos] * 2;
                if (t > 9) {
                    t -= 9;
                }
                sum += t;
            }
            else {
                sum += str[pos];
            }
        }

        //
        // Choose the last digit so that it causes the entire string to pass the checksum.
        //

        final_digit = (10 - (sum % 10)) % 10;
        str[len - 1] = final_digit;

        // Output the IMEI value.
        t = str.join('');
        t = t.substr(0, len);
        return t;
    }

    const IMEI = imei_gen().toString()
    try {
        const data = contract.methods.updateIMEIStatus(IMEI, 1, req.decodedData.did)
        const transaction = await web3js.eth.accounts.signTransaction({
            to: process.env.REACT_APP_IMEI_CONTRACT_ADDRESS,
            data: data.encodeABI(),
            gas: await data.estimateGas({ from: process.env.WALLET_ADDRESS }),
            gasPrice: await web3js.eth.getGasPrice(),
            nonce: await web3js.eth.getTransactionCount(process.env.WALLET_ADDRESS)
        }, process.env.WALLET_PRIVATE_KEY)
        const receipt = await web3js.eth.sendSignedTransaction(transaction.rawTransaction)
        fs.writeFileSync(`${IMEI}.txt`, `IMEI: ${IMEI}\nDID: ${req.decodedData.did}\nStatus: Whitelisted`)
        res.download(`${IMEI}.txt`, `${IMEI}.txt`)
        setTimeout(() => {
            fs.unlinkSync(`${IMEI}.txt`)
        }, 3000);
    } catch (error) {
        console.log(error)
        res.status(400).send({
            message: "Something went wrong! Please try again later."
        })
    }
})

app.post('/updateIMEIStatus', isAuthenticated, async (req, res) => {
    try {
        let { imei, status } = req.body
        if (status === "Blacklist") {
            status = 3
        }
        else if (status === "Whitelist") {
            status = 1
        }

        const didInLedger = await contract.methods.getOwnerDID(imei).call()
        if (didInLedger !== req.decodedData.did) {
            res.send({
                message: "You are not authorized to update this IMEI!"
            })
            return
        }

        const data = contract.methods.updateIMEIStatus(imei, status, req.decodedData.did)
        const transaction = await web3js.eth.accounts.signTransaction({
            to: process.env.REACT_APP_IMEI_CONTRACT_ADDRESS,
            data: data.encodeABI(),
            gas: await data.estimateGas({ from: process.env.WALLET_ADDRESS }),
            gasPrice: await web3js.eth.getGasPrice(),
            nonce: await web3js.eth.getTransactionCount(process.env.WALLET_ADDRESS)
        }, process.env.WALLET_PRIVATE_KEY)
        const receipt = await web3js.eth.sendSignedTransaction(transaction.rawTransaction)
        res.send({
            message: "Status updated successfully!"
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            message: "Something went wrong! Please try again later."
        })
    }
})

app.listen(5002, () => { })
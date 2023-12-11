import createAgent from "./CreateAgent.js";
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(bodyParser.json())
app.use(cors())

dotenv.config({ path: "../../.env" })

let host = "issuer"
let port = 7100

const issuerAgent = async (email, password) => {
    try {
        const agent = await createAgent(email, password, host, port)
        return agent
    } catch (error) {
        console.log(error)
    }
}
const agent = await issuerAgent("issuer", "issuer")

if ((await agent.modules.anoncreds.getCreatedCredentialDefinitions({})).length === 0) {
    const schemaResult = await agent.modules.anoncreds.registerSchema({
        schema: {
            attrNames: ["number", "operator"],
            issuerId: (await agent.dids.getCreatedDids())[0].did,
            name: "Schema1",
            version: '1.0.0',
        },
        options: {},
    })
    if (schemaResult.schemaState.state === 'failed') {
        throw new Error(`Error creating schema: ${schemaResult.schemaState.reason}`)
    }
    const credentialDefinitionResult = await agent.modules.anoncreds.registerCredentialDefinition({
        credentialDefinition: {
            tag: 'latest',
            issuerId: (await agent.dids.getCreatedDids())[0].did,
            schemaId: schemaResult.schemaState.schemaId,
        },
        options: {},
    })
    if (credentialDefinitionResult.credentialDefinitionState.state === 'failed') {
        throw new Error(
            `Error creating credential definition: ${credentialDefinitionResult.credentialDefinitionState.reason}`
        )
    }
}

app.get("/getCredentialDefinitionId", async (req, res) => {
    try {
        res.send({
            "credentialDefinitionId": (await agent.modules.anoncreds.getCreatedCredentialDefinitions({}))[0]._tags.unqualifiedCredentialDefinitionId
        })
    } catch (error) {
        console.log(error)
    }
})

app.post("/issue", async (req, res) => {
    try {
        const { outOfBandRecord, connectionRecord } = await agent.oob.receiveInvitationFromUrl(decodeURIComponent(req.body.invitationUrl))
        await agent.connections.returnWhenIsConnected(connectionRecord.id)
        await agent.credentials.offerCredential({
            protocolVersion: 'v1',
            connectionId: connectionRecord.id,
            credentialFormats: {
                indy: {
                    credentialDefinitionId: (await agent.modules.anoncreds.getCreatedCredentialDefinitions({}))[0]._tags.unqualifiedCredentialDefinitionId,
                    attributes: [
                        { name: 'number', value: Math.floor(1000000000 + Math.random() * 9000000000).toString() },
                        { name: 'operator', value: 'Vodafone' },
                    ],
                },
            },
        })
        res.send({
            "message": "Credential Issued Successfully"
        })
    } catch (error) {
        console.log(error)
    }
})

app.listen(5001)
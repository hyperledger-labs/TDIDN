import createAgent from './CreateAgent.js'
import bodyParser from 'body-parser'
import express from 'express'

const app = express()
app.use(bodyParser.json())

const stewardAgent = async () => {
    const agent = await createAgent("stewardWalletId", "testkey0000000000000000000000000", "steward", 5100)
    return agent
}

app.post('/endorseDID', async (req, res) => {
    try {
        const agent = await stewardAgent()
        const signedNymRequest = await agent.modules.indyVdr.endorseTransaction(
            req.body.nymRequest,
            (await agent.dids.getCreatedDids())[0].did
        )
        await agent.shutdown()
        res.send({ signedNymRequest: signedNymRequest })
    } catch (error) {
        console.log(error)
    }
})

app.listen(5000)
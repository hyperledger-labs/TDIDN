import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config({ path: '../../.env' })

export const isAuthenticated = async (req, res, next) => {
    try {
        const authorization = req.headers['authorization']
        const token = authorization.split(" ")[1]
        if (!token) {
            res.status(401).send({
                "message": "Token not found"
            })
        }
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.decodedData = decodedData
        next();
    } catch (error) {
        console.log(error)
        res.status(405).send({
            "message": error
        })
    }
}
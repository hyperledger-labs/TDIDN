# Telecom Decentralized Identities Network (TDIDN)

TDIDN is a decentralized identity and smart contract system designed for telecom applications. It specializes in DID-based authentication, privacy management, and offers efficient solutions for blacklist management, SLAs, and billing utilizing CDRs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [License](#license)

## Prerequisites

Before you start, make sure you have the following prerequisites installed on your system:

- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/engine/install/)
- [Hyperledger Indy test pool](https://github.com/hyperledger/indy-sdk?tab=readme-ov-file#3-starting-the-test-pool-on-a-docker-network)

## Getting Started

Follow these steps to set up and run the project on your local machine:

1. **Clone and Navigate**: Clone the project repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Environment Variables**: Copy the contents from the `.env.sample` file and paste them into a new `.env` file. This file contains essential environment variables required for the project.

3. **Deploy the IMEI Smart Contract**: Follow the deployment instructions provided in [this article](https://hackernoon.com/deploying-your-smart-contract-on-ethereums-sepolia-testnet-using-remix-or-dapp-development-series) to deploy the IMEI smart contract (`IMEI.sol` available in the `contracts` folder).

4. **Update Environment Variables**: After successfully deploying the smart contract, update the following environment variables in your project:
     - `REACT_APP_IMEI_CONTRACT_ADDRESS`: Set this variable to the contract address obtained during deployment.
     - `WALLET_ADDRESS`: Set this variable to your Ethereum wallet address.
     - `WALLET_PRIVATE_KEY`: Set this variable to your Ethereum wallet private key.

5. **Build and Run the Project**: Use Docker Compose to build and run the project:
   ```bash
   docker-compose up --build
   ```

6. **Update the Database**:
   - Find the Docker container ID of the `holder` service using the following command:
     ```bash
     docker ps
     ```
   - Inside the Docker container of the `holder` service, use the container ID to run the following command and update the database schema using Prisma:
     ```bash
     docker exec -it <container-id> npx prisma db push
     ```

## License

This project is licensed under the [MIT License](LICENSE).

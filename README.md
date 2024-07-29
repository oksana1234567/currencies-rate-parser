# Currency Rate Application

This repository contains two main parts of the application:

1. **Currency Rate Client**: An Angular frontend application.
2. **Currency Rate Service**: A NestJS backend application with a cron task and PostgreSQL database.

## Prerequisites

- Node.js and npm
- Docker
- CoinMarketCap API key

## Currency Rate Client

The Currency Rate Client is an Angular application that interacts with the backend to display currency rates.

### Environment Configuration

Create a file `src/environments/environment.ts` with the following content:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
};
```

### Install dependencies

npm install

### Run the application

ng serve

Access the application in your browser at http://localhost:4200.

## Currency Rate Service

### Environment Configuration

COINMARKETCAP_API_KEY=<your-coinmarketcap-api-key>
API_URL=https://pro-api.coinmarketcap.com
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=currency_rate

### Obtaining CoinMarketCap API Key

Sign up on CoinMarketCap:
Go to CoinMarketCap and sign up for an account.

Generate API Key:
Once logged in, navigate to the API section and generate a new API key.

Set API Key:
Replace <your-coinmarketcap-api-key> in the .env file with the actual API key obtained from CoinMarketCap.

### Installation and Running the Service

# Install dependencies

npm install

# Start the PostgreSQL database

docker-compose up -d

# Run the application

npm run start

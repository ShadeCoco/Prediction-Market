# Decentralized Prediction Market for Software Development

This project implements a simplified blockchain-based Decentralized Prediction Market for Software Development using Clarity smart contracts on the Stacks blockchain. It allows developers to create and participate in prediction markets related to software development tasks, bug fixes, or feature completions.

## Features

- Create prediction markets for software development tasks
- Place bets on binary outcomes (Yes/No)
- Resolve markets and distribute winnings
- Simple and efficient smart contract design

## Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) (v14 or later)
- [Clarinet](https://github.com/hirosystems/clarinet) (for Clarity smart contract development)
- [Vitest](https://vitest.dev/) (for testing)

## Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/your-username/prediction-market.git
   cd prediction-market
   \`\`\`

2. Install the dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Set up Clarinet:
   \`\`\`
   clarinet new
   \`\`\`

## Usage

### Deploying the Smart Contract

1. Copy the \`prediction-market.clar\` file to the \`contracts\` directory in your Clarinet project.

2. Deploy the contract using Clarinet:
   \`\`\`
   clarinet deploy
   \`\`\`

### Interacting with the Contract

You can interact with the contract using Clarinet's console or by building a frontend application. Here are some example interactions:

1. Create a market:
   \`\`\`
   (contract-call? .prediction-market create-market "Will feature X be implemented by EOY?" u100)
   \`\`\`

2. Place a bet:
   \`\`\`
   (contract-call? .prediction-market place-bet u1 true u50000000)
   \`\`\`

3. Resolve a market:
   \`\`\`
   (contract-call? .prediction-market resolve-market u1 true)
   \`\`\`

4. Claim winnings:
   \`\`\`
   (contract-call? .prediction-market claim-winnings u1)
   \`\`\`

## Smart Contract Functions

1. \`create-market\`: Creates a new prediction market.
    - Parameters: \`description\` (string-ascii 256), \`deadline\` (uint)
    - Returns: market ID (uint)

2. \`place-bet\`: Places a bet on a market.
    - Parameters: \`market-id\` (uint), \`bet-on-yes\` (bool), \`amount\` (uint)
    - Returns: true if successful

3. \`resolve-market\`: Resolves a market with the final outcome.
    - Parameters: \`market-id\` (uint), \`outcome\` (bool)
    - Returns: true if successful

4. \`claim-winnings\`: Claims winnings for a resolved market.
    - Parameters: \`market-id\` (uint)
    - Returns: amount of winnings (uint)

## Testing

To run the tests for the smart contract, use Vitest:

\`\`\`
npm test
\`\`\`

## Contributing

Contributions to the Decentralized Prediction Market are welcome. Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (\`git checkout -b feature/amazing-feature\`)
3. Make your changes
4. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
5. Push to the branch (\`git push origin feature/amazing-feature\`)
6. Open a Pull Request

## License

This project is licensed under the MIT License. See the \`LICENSE\` file for details.

## Contact

If you have any questions or feedback, please open an issue on the GitHub repository.

Happy predicting!


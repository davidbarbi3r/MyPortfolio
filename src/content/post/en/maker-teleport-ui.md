---
publishDate: 2023-01-12T00:00:00Z
title: Maker teleport UI
excerpt: UI for the Maker Teleport Bridge, the goal was to provide a smooth user experience to bridge assets from L2 to L1 using the TeleportSDK and smart contract. 
image: '~/assets/images/maker-teleport.jpg'
category: Portfolio
tags:
  - next.js
  - ether.js
  - typescript
  - blockchain
metadata:
  canonical: https://davidbarbier.com/maker-teleport-ui
---

## Project goals

I made the UI for the Maker Teleport Bridge with an experienced blockchain dev. He introduced me to the web3 libraries to interact with smart contracts and provide the best user experience possible. 

This project was fun to implement because we worked in team, letting each other time and the place to implement new useful features for the project. 

I hope this project will be officialy used and improved by maker for the official futur release of the Teleport Bridge. 

## Current features

Here are the current features implemented in this UI project:
  - [X] A user can connect his wallet in a secured way,
  - [X] The user can see the amount of DAI owned by chain, 
  - [X] can swap tokens for DAI to use the secured bridge,
  - [X] can change current chain,
  - [X] can bridge token from L2 to L1 (alpha feature as the teleport smart-contract is still in development)

## Future improvements 

Nexts steps for this project: 
   - [ ] display in which step the user is when bridging occurs (initiating teleport, waiting for attestation, calling oracles);
   - [ ] add text explanations in wallet pop up for user;
   - [ ] add advanced options (to & data) for users using relay;
   - [ ] understand how the teleport is supposed to work when the user haven't enough DAI to pay for the relay fees.;

## Deployment

This project have been depoyed in a decentralized way, we used fleek to host it on IPFS, and used ENS for the domain name. (the deployment technique is not the best to provide a fast website, it take a lot of time to display properly)

## Links

- [Decentralized Deployed Project](http://teleportdai.eth.link)
- [Github Repo](https://github.com/davidbarbi3r/maker-teleport)
- [Teleport SDK docs](https://makergrowth.github.io/teleport-sdk-docs/)
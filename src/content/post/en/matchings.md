---
publishDate: 2023-06-06T00:00:00Z
title: Matchings
excerpt: A custom web app made for a leasing company to help them manage their tyres. 
image: '~/assets/images/robert-laursoo-WHPOFFzY9gU-unsplash.jpg'
category: Portfolio
tags:
  - react
  - materialUI
  - express.js
  - firebase
  - open-api
metadata:
  canonical: https://www.davidbarbier.com/matchings
---


## Project goals

This project was challenging, I had to deliver this web app as fast as possible

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
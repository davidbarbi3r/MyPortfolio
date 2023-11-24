---
publishDate: 2023-06-06T00:00:00Z
title: Matchings
excerpt: A tailored fullstack web app made for a leasing company to help them manage their tyres. 
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

** Custom Development **

This project has been a significant technical challenge during its implementation. I had the opportunity to work in a team with another experienced developer who validated my work, allowing me to make substantial progress and ensure the delivery of functional and high-quality work to the client.

## Project Objectives
This project was commissioned by a consortium of leasing companies to manage their tire inventory. It may seem straightforward, but with a fleet of over 10,000 vehicles, proper tire management enables the company to achieve substantial cost savings.

The application was intended to:

Read Excel files (their previous management method) and process them to import tires into the database.
Allow certain types of users (role-based system) to modify and delete entries.
Enable tire exchange requests for drivers, with the application initiating a hierarchical validation process and performing the transfer as well as the request to the carrier's API.
Send specific tire order formats to a third-party API to obtain bulk price optimization (API developed by a data team).
Technological Choices
For the frontend, React with Typescript and Material UI were used. These technologies were a perfect fit for developing the application, making it visually appealing with a good user experience without spending excessive time. The application also had the requirement of being multilingual, which was achieved using I18n.

For the backend, a RESTful API was built using ExpressJS with Typescript, along with Swagger for potential future stakeholders to integrate with the project.

Firebase (NoSQL) was used for the database to allow rapid iteration on data models as needed. Firebase also provides an authentication management system and ensures service scalability if the number of users were to increase significantly.

## Future Enhancements
The application was delivered as a fully functional MVP, which allowed the company to establish partnerships and secure funding. Future developments may be necessary based on actual user feedback during the application's lifecycle, but there are no immediate plans for enhancements.

## Deployment
The project was deployed for testing with each pull request to ensure overall functionality by the client. Once validations were completed, they were promoted to the production version. Google Cloud services were utilized for this project.

## Links
Due to the internal nature of this application, I cannot provide relevant links.
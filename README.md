# Consigliere

Consigliere is a Proof of Concept enabling users that their organization is using Office 365 and Exchange quickly book meeting rooms.

<img src="https://upload.wikimedia.org/wikipedia/en/thumb/6/67/Tom_Hagen.jpg/220px-Tom_Hagen.jpg" align="right" />

## Roadmap

* [x] Present the initial PoC to a group of people
* [ ] Add integration tests
* [ ] Refactor the codebase using TDD
* [ ] Implement the Slack application strategy (user interface)
* [ ] Present the new interface to people
* [ ] Complete the documentations and deployment strategy

## Getting started

It is a normal Node.js project that uses TypeScript. However, you will need to configure it first. You will need:
1. An Application Registry in Azure Tenant
2. Up and running Office 365 domain with some meeting rooms registered 

If you are _really_ interested in developing this project, you don't have to go through the mentioned steps, you can drop Ehsaan a message. He will send you the config you use his testing domain: `sc4ck.onmicrosoft.com`.

### Your own config
If you want to spin up your own sandbox, I'd highly recommend to sign up in [Office 365 developer program](https://developer.microsoft.com/en-us/microsoft-365/dev-program), you can have a complete sandbox environment with some sample data.

After spinning up the sandbox, follow these steps:
1. Create an Azure subscription in the same tenant (your sandbox domain).
2. Go to Azure Active Directory &raquo; Application Registry, create a new entry with the type Web and use `http://localhost:3000/redirect` for the callback URL.
3. You will have client ID and authority. Set these values for `CLIENT_ID` and `AUTHORITY` environment variables, respectively.
4. Create a client secret and assign it to `CLIENT_SECRET`.
5. Create as many rooms as you want in Exchange admin panel.
6. Create a DistributionList for your rooms using PowerShell. Here's [the link to the Microsoft guide](https://docs.microsoft.com/en-us/exchange/recipients/room-mailboxes?view=exchserver-2019#use-the-exchange-management-shell-to-create-a-room-list) on this.
7. Modify the list of rooms in `src/config/rooms.ts` file accordingly.

## License
Do whatever the f**k you want to do with it.

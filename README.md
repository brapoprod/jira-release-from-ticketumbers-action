# jira-release-from-ticketumbers-action
This action will allow you to create a JIRA release by a list of ticketnumbers that are provided

## Inputs

### `jiraUrl`
**Required** The base URL for your JIRA installment

### `jiraPAT`
**Required** Personal access token with read and write access to the JIRA project you want to access. If you need to know how to create and manage these, go to [the following link](https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html)

### `jiraProjectKey`
**Required** The key of the project you want to use f.e. `PRJ` which is also the default.

### `jiraProjectId`
**Required** The ID of the project you want to use f.e. `1234` which is also the default

### `releaseName`
The name that you want to give the release in JIRA

### `releaseDescription`
The description you want to give the release in JIRA

### `jiraTicketIds`
**Required** An array of tickets that need to be included in the release f.e. ["PRJ-1", "PRJ-2"].
If you want to retrieve this from the PRs in a github release, you can use [this action](https://github.com/brapoprod/get-jira-tickets-from-github-release-action).

### `isReleased`
This sets the JIRA released state to the desired state (boolean). Default is `true`

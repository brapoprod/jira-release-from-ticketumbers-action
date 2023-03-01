const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

try {
  // Replace with your JIRA base URL, username, and API token
  const JIRA_URL = core.getInput("jiraUrl");
  const JIRA_AUTH_TOKEN = core.getInput("jiraPAT");

  // Replace with the ID of the project you want to create a release for
  const PROJECT_KEY = core.getInput("jiraProjectKey");
  const PROJECT_ID = core.getInput("jiraProjectId");

  // Replace with the desired name and description for the release
  const RELEASE_NAME = core.getInput("releaseName");
  const RELEASE_DESCRIPTION = core.getInput("releaseDescription");

  // Set the endpoint for creating a version in JIRA
  const CREATE_VERSION_ENDPOINT = `${JIRA_URL}/rest/api/2/version`;

  // Gets the current date in YYYY-MM-DD
  const date = new Date();
  const releaseDate = date.toISOString().slice(0, 10);

  // Set the released state in JIRA
  const isReleased = core.getInput("isReleased") === "true";

  const closeTicketsAfterRelease =
    core.getInput("closeTicketsAfterRelease") === "true";

  // Set the payload with the release name and description
  const payload = {
    name: RELEASE_NAME,
    description: RELEASE_DESCRIPTION,
    project: PROJECT_KEY,
    projectId: PROJECT_ID,
    released: isReleased,
    releaseDate,
  };

  // Send a POST request to the endpoint to create the release
  axios
    .post(CREATE_VERSION_ENDPOINT, payload, {
      headers: { Authorization: `Bearer ${JIRA_AUTH_TOKEN}` },
    })
    .then(async (response) => {
      // If the request is successful, the release was created
      console.log(
        `Release successfully created ${JSON.stringify(response.data)}`
      );

      const newVersionId = response.data.id;
      const CHANGE_ISSUE_ENDPOINT = `${JIRA_URL}/rest/api/2/issue`;

      const ticketIds = JSON.parse(core.getInput("jiraTicketIds"));

      // Loop over tickets
      ticketIds.forEach(async (ticketId) => {
        // assign them to new release
        const ticketPayload = {
          update: {
            fixVersions: [{ add: { id: newVersionId } }],
          },
        };
        try {
          const ticketsAdded = await axios.put(
            `${CHANGE_ISSUE_ENDPOINT}/${ticketId}`,
            ticketPayload,
            {
              headers: { Authorization: `Bearer ${JIRA_AUTH_TOKEN}` },
            }
          );

        console.log(ticketsAdded.status);
        } catch (error) {
          console.log(error.message);
        }

        // If tickets need to be closed, close them
        if (closeTicketsAfterRelease) {
          const transitionId = await axios.get(`${CHANGE_ISSUE_ENDPOINT}/${ticketId}/transitions`, {
            headers: { Authorization: `Bearer ${JIRA_AUTH_TOKEN}` },
          }).data.transitions.find(tr => tr.name === "Done").id
          const closePayload = {
            update: {
              comment: [
                {
                  add: {
                    body: "Resolved via automated process.",
                  },
                },
              ],
            },
            fields: {
              resolution: {
                name: "Done",
              },
            },
            transition: {
              id: transitionId,
            },
          };

          try {
            const closeTickets = await axios.post(
              `${CHANGE_ISSUE_ENDPOINT}/${ticketId}/transitions`,
              closePayload,
              {
                headers: { Authorization: `Bearer ${JIRA_AUTH_TOKEN}` },
              }
            );
          } catch (error) {
            console.log(error.message);
          }
        }

      });
    })
    .catch((error) => {
      // If the request is unsuccessful, print the error message
      console.log(
        `Error creating release: ${JSON.stringify(error.response.data)}`
      );
    });
} catch (error) {}

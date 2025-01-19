import { fetch } from 'bun';

async function getGitHubActivity(username: string) {
  try {
    if (!username) {
      console.error("Error: you must provide a username");
      process.exit(1);
    }

    const url = `https://api.github.com/users/${username}/events`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "BunCLI"
      }
    })

    if (!response.ok) {
      console.error(`Error: Could not retrieve user activity for ${username}. (${response.status})`);
      process.exit(1);
    }

    interface GitHubEvent {
      type: string;
      repo: {
        name: string;
      };
      payload: {
        action?: string;
        commits?: { length: number }[];
      };
    }

    const events = await response.json() as GitHubEvent[];

    if (events.length === 0) {
      console.log(`There is no recent activity for user ${username}.`);
      return
    }

    console.log(`Recent activity of ${username}:`);

    for (const event of events.slice(0, 10)) {
      switch (event.type) {
        case "PushEvent": {
          const commitCount = event.payload.commits ? event.payload.commits.length : 0;
          console.log(`- Pushed ${commitCount} commits to ${event.repo.name}`);
          break;
        }
        case "IssuesEvent":
          console.log(`- ${event.payload.action} an issue in ${event.repo.name}`);
          break;
        case "WatchEvent":
          console.log(`- Starred ${event.repo.name}`);
          break;
        default:
          console.log(`- ${event.type} on ${event.repo.name}`);
      }
    }
  } catch (error) {
    console.error("Error unexpected: ", error);
  }
}

const username = process.argv[2];
getGitHubActivity(username);

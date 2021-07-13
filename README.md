# weekly-minutes
Automatically update minutes for Indico weekly meetings from my recent pull requests


## What?

Generates an HTML summary of my PRs from the last week and
posts them to the appropriate contribution in the weekly
developer meeting event.

## Requirements

- Node v14+
- Indico API token with read/write access

## Usage

Create a `config.json` file in the project with
the following keys:

```json
{
    "token": "indp_XXXXXXXXXXXXX",
    "fullName": "Doe, John",
    "githubUsername": "octocat"
}
```

Run

```
npm install && node main.js
```


## TODO

- include all indico repositories, e.g., newdle, ..

const { Octokit } = require("@octokit/rest")

const updateMinutes = require("./indico.js")
const config = require("./config.json")

const octokit = new Octokit({
    auth: config.token
})

async function getRepos() {
    return (
        await octokit.rest.teams.listReposInOrg({
            org: "indico",
            team_slug: "development-team"
        })
    ).data
}

function formatPull({ title, html_url, number }) {
    return `<li><span class="js-issue-title markdown-title">
                ${title} (<a href="${html_url}">#${number}</a>)
            </span></li>`
}

function formatMinutes({ closed, open }) {
    closed = closed.map(formatPull).join("\n")
    open = open.map(formatPull).join("\n")

    return `<p><span style="font-size:18px">Development</span></p>
            <p><u>Closed</u></p>
            <ul>
                ${closed}
            </ul>
            <p><u>WIP</u></p>
            <ul>
                ${open}
            </ul>`
}

async function getRecentPullsForRepo(user, repo) {
    const result = await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user}+is:pr+repo:${repo}`,
        sort: "created",
        order: "asc"
    })

    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 8) // Last 8 days

    const closed = result.data.items.filter(item => item.state === "closed" && new Date(item.closed_at) > lastWeek)
    const open = result.data.items.filter(item => item.state === "open")
    return { closed, open }
}

async function main({ githubUsername, fullName, token }) {
    // console.log(await getRepos())
    const repos = await getRepos()
    const results = repos.map(repo => getRecentPullsForRepo(githubUsername, repo.full_name))
    let pullsByRepo = {}
    Promise.all(results).then(data => {
        data.forEach((pulls, i) => {
            pullsByRepo[repos[i].full_name] = pulls
        })

        console.dir(pullsByRepo, { depth: null })
    })

    for (const repo in pullsByRepo) {
        if (pullsByRepo[repo]) {
            const minutes = formatMinutes(pulls)
        }
    }

    // try {
    //     await updateMinutes(fullName, minutes, token)
    // } catch (err) {
    //     console.error(err)
    // }
}

main(config)

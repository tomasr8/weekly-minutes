const { Octokit } = require("@octokit/rest");

const octokit = new Octokit()

function formatPull({ title, html_url, number }) {
    return `<li><span class="js-issue-title markdown-title">
                ${title} (<a href="${html_url}">#${number}</a>)
            </span></li>`
}

function formatMinutes(closedPulls, openPulls) {
    const closed = closedPulls.map(formatPull).join("\n")
    const open = openPulls.map(formatPull).join("\n")


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

async function getRecentPulls(user) {
    // TODO: add other repos ,e.g., newdle
    const result = await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user}+is:pr+repo:indico/indico`,
        sort: "created",
        order: "asc"
      });

    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const closedPulls = result.data.items.filter(item => item.state === "closed" && (new Date(item.closed_at)) > lastWeek)
    const openPulls = result.data.items.filter(item => item.state === "open")
    return [closedPulls, openPulls]
}

async function main() {
    const pulls = await getRecentPulls("tomasr8")
    console.log(formatMinutes(...pulls))
}

main()

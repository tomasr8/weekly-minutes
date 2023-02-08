const chalk = require("chalk")

async function getEventId(token) {
    const url = "https://indico.cern.ch/export/categ/15326.json?from=today&to=today"
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return (await response.json()).results[0]
}

async function getContributionId(eventId, fullName, token) {
    const url = `https://indico.cern.ch/export/event/${eventId}.json?detail=contributions`
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const { contributions } = (await response.json()).results[0]
    return contributions.find(c => c.speakers[0]?.fullName === fullName).db_id
}

async function updateMinutes(eventId, contributionId, html, token) {
    const url = `https://indico.cern.ch/event/${eventId}/contributions/${contributionId}/note/edit`
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            form: { source: html }
        }
    })
    return response.statusCode
}

module.exports = async (fullName, minutes, token) => {
    const eventId = await getEventId(token)
    console.log(`Updating notes in event ${chalk.yellow(eventId)}`)

    const contributionId = await getContributionId(eventId, fullName, token)
    console.log(`Found contribution ${chalk.yellow(contributionId)}`)

    await updateMinutes(eventId, contributionId, minutes, token)
    console.log(chalk.green("Notes updated"))
}

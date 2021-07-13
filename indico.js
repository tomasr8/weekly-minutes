const request = require("request")
const chalk = require("chalk")

function getEventId(token) {
    const url = "https://indico.cern.ch/export/categ/11175.json?from=today&to=today"
    return new Promise((resolve, reject) => {
        request({ url, headers: { Authorization: `Bearer ${token}` } }, (error, response, body) => {
            if (error) {
                return reject(error)
            }

            body = JSON.parse(body)
            const category = body.results[0]
            return resolve(category.id)
        })
    })
}

function getContributionId(eventId, fullName, token) {
    const url = `https://indico.cern.ch/export/event/${eventId}.json?detail=contributions`

    return new Promise((resolve, reject) => {
        request({ url, headers: { Authorization: `Bearer ${token}` } }, (error, response, body) => {
            if (error) {
                return reject(error)
            }

            body = JSON.parse(body)
            const { contributions } = body.results[0]
            const contributionId = contributions.find(c => c.speakers[0]?.fullName === fullName).db_id
            return resolve(contributionId)
        })
    })
}

function updateMinutes(eventId, contributionId, html, token) {
    const url = `https://indico.cern.ch/event/${eventId}/contributions/${contributionId}/note/edit`

    return new Promise((resolve, reject) => {
        request.post(
            {
                url,
                headers: { Authorization: `Bearer ${token}` },
                form: { source: html }
            },
            (error, response, body) => {
                if (error) {
                    return reject(error)
                }

                return resolve(response.statusCode)
            }
        )
    })
}

module.exports = async (fullName, minutes, token) => {
    const eventId = await getEventId(token)
    console.log(`Updating notes in event ${chalk.yellow(eventId)}`)

    const contributionId = await getContributionId(eventId, fullName, token)
    console.log(`Found contribution ${chalk.yellow(contributionId)}`)

    await updateMinutes(eventId, contributionId, minutes, token)
    console.log(chalk.green("Notes updated"))
}

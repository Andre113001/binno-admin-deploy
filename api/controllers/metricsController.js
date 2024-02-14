const db = require('../../database/db')

// NOTE: add additional parameters for the new database - AL
const countField = (field_name) => {
    return new Promise((resolve, reject) => {
        const countQuery = `
            SELECT COUNT(${field_name}_id) as count FROM ${field_name}_i
        `;
        // NOTE: new query for the new database - AL
        // const countQuery = `
        //     SELECT COUNT(${field_name}_id) as count FROM ${field_name}
        // `;
        db.query(countQuery, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data[0].count)
            }
        })
    })
}

const countEmailSubscriber = () => {
    return new Promise((resolve, reject) => {
        const countSubscribedEmailQuery = `
            SELECT COUNT(email_id) as count FROM email_i WHERE email_subscribe = 1
        `;
        // NOTE: new query for the new database - AL
        // const countSubscribedEmailQuery = `
        //     SELECT COUNT(email_id) as count FROM email WHERE subscribe = 1
        // `;
        db.query(countSubscribedEmailQuery, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data[0].count)
            }
        })
    })
}
const countMemberByType = (type) => {
    return new Promise((resolve, reject) => {
        const countMemberByTypeQuery = `
            SELECT COUNT(member_id) as count FROM member_i WHERE member_type = ?
        `;
        // NOTE: new query for the new database - AL
        // const countMemberByTypeQuery = `
        //     SELECT COUNT(member_id) as count FROM member_profile WHERE member_class = ?
        // `;
        db.query(countMemberByTypeQuery, [type], (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data[0].count)
            }
        })
    })
}

// WARN: obsolete for the new database - AL
const countPending = (type) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT COUNT(${type}_id) as count FROM ${type}_i WHERE ${type}_approval = 0`,
            (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data[0].count)
                }
            }
        )
    })
}

/*
 *
 *
 *
 */

const getContents = async (req, res) => {
    try {
        let count = 0
        const blogs = await countField('blog')
        const posts = await countField('post')
        const events = await countField('event')
        const program = await countField('program')

        count = blogs + posts + events + program

        return res.status(200).json(count)
        // if (result.length > 0) {
        //     return res.status(200).json({ result: result })
        // } else {
        //     return res.status(404).json({ result: null })
        // }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
const getMembers = async (req, res) => {
    try {
        const members = await countField('member')

        return res.status(200).json(members)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
const getNewsletterSubscriber = async (req, res) => {
    try {
        const members = await countEmailSubscriber()

        return res.status(200).json(members)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

const getEnablers = async (req, res) => {
    try {
        const members = await countMemberByType(2)

        return res.status(200).json(members)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

const getCompanies = async (req, res) => {
    try {
        const members = await countMemberByType(1)

        return res.status(200).json(members)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

// WARN: obsolete for the new database
// because post approval is not needed anymore - AL
const getPendingPosts = async (req, res) => {
    try {
        const members = await countPending('post')

        return res.status(200).json(members)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

// NOTE: should be renamed to getPendingApplications()
const getPendingMembers = async (req, res) => {
    try {
        const count = await new Promise((resolve, reject) => {
            const countPendingApplications = `
                SELECT COUNT(app_id) as count FROM application_i
            `;
            // NOTE: new query for the new database - AL
            // const countPendingApplications = `
            //     SELECT COUNT(application_id) as count FROM pending_application
            // `;
            db.query(countPendingApplications, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data[0].count)
                }
            })
        })

        // console.log(count)
        return res.status(200).json(count)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

const getRecentActivities = async (req, res) => {
    try {
        const count = await new Promise((resolve, reject) => {
            const getRecentActivitiesQuery = `
                SELECT * FROM history_i
                ORDER BY history_datecreated DESC
                LIMIT 4
            `;
            // NOTE: new query for the new database - AL
            // const getRecentActivitiesQuery = `
            //     SELECT * FROM activity_log
            //     ORDER BY date_created DESC
            //     LIMIT 4
            // `;
            db.query(getRecentActivitiesQuery, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })

        console.log(count)
        return res.status(200).json(count)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

module.exports = {
    getContents,
    getMembers,
    getNewsletterSubscriber,
    getEnablers,
    getCompanies,
    getPendingPosts,
    getPendingMembers,
    getRecentActivities,
}

const db = require('../../database/db')

//Middlewares
const sanitizeId = require('../middlewares/querySanitizerMiddleware')
const uniqueId = require('../middlewares/uniqueIdGeneratorMiddleware')
const { generateAndHash } = require('../middlewares/randomGenerator')
const fs = require('fs')
const path = require('path')

const uploadDocuments = async (req, res) => {
    // Assuming you have the applicationId available in your request or somewhere
    const { appId } = req.body // Replace with your logic to get the applicationId

    // Path to the destination folder
    const destinationFolder = `./private/docs/application/${appId}`

    // Create the destination folder if it doesn't exist
    if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true })
    }

    // Process each uploaded file
    req.files.forEach((file, index) => {
        const originalName = file.originalname
        const ext = path.extname(originalName)

        // Generate a new file name based on the applicationId
        const newFileName = `${String(appId)}_${index + 1}${String(ext)}`

        // Move the file to the destination folder
        fs.writeFileSync(path.join(destinationFolder, newFileName), file.buffer)
    })

    res.status(200).send('Files uploaded successfully!')
}

const getApplications = async (req, res) => {
    try {
        const apps = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM application_i`, (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })

        return res.status(200).json(apps)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
const getApplicationUploads = async (req, res) => {
    const { appId } = req.params
    try {
        const apps = await new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM application_i WHERE app_id = ?`,
                [appId],
                (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data)
                    }
                }
            )
        })

        return res.status(200).json(apps)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

const getImageBlob = (imagePath) => {
    return fs.readFileSync(imagePath)
}

const getApplicationDetails = async (req, res) => {
    const { appId } = req.params

    const imgPath = path.join(
        __dirname,
        `../../private/docs/application/${appId}`
    )

    console.log(imgPath)
    try {
        const app = await new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM application_i WHERE app_id = ?`,
                [appId],
                (err, data) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(data[0])
                    }
                }
            )
        })
        // Get the list of files in the directory
        const files = fs.readdirSync(imgPath)

        // Add the file names to the response object
        app.files = files

        return res.status(200).json(app)
        const imageBlob = getImageBlob(imgPath)

        // Set the appropriate content type for the image
        res.setHeader('Content-Type', 'image/jpeg') // Adjust the content type based on your image format

        // Send the image binary data as the response
        res.send(imageBlob)
    } catch (error) {
        console.error('Error fetching image:', error)
        res.status(500).send('Internal Server Error')
    }
}

const setApprovalStatus = async (req, res) => {
    const { appId, isApproved = true, rejectReason = '' } = req.body
    try {
        if (!!isApproved) {
            const fetchedData = await new Promise((resolve, reject) => {
                db.query(
                    `DELETE FROM application_i WHERE app_id = ${appId}`,
                    (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    }
                )
            })

            res.send('Deleted application.')
        } else {
            const fetchedData = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT * FROM application_i WHERE app_id = '${appId}'`,
                    (err, data) => {
                        if (err) {
                            reject('asd')
                        } else {
                            resolve(data[0])
                        }
                    }
                )
            })

            if (!fetchedData) {
                return
            }

            const insertedData = await new Promise((resolve, reject) => {
                const currentDate = new Date()
                const formattedDate = currentDate
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ')

                const newId = uniqueId.uniqueIdGenerator()
                db.query(
                    `INSERT INTO email_i (email_id, email_datecreated, email_address, email_subscribe, email_flag) VALUES ('${newId}','${formattedDate}', '${fetchedData.app_email}', '1', '1')`,
                    (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    }
                )

                const contactId = uniqueId.uniqueIdGenerator()
                db.query(
                    `INSERT INTO member_contact (contact_id, contact_datecreated, contact_email) VALUES ('${contactId}', '${formattedDate}', '${newId}')`,
                    (err, data) => {
                        if (err) {
                            reject(err)
                        }
                    }
                )

                const insertMemberSettings = () => {
                    return new Promise((resolve, reject) => {
                        db.query(
                            `INSERT INTO member_settings (setting_institution, setting_address, setting_datecreated, setting_status) VALUES (?, ?, ?, '1')`,
                            [
                                fetchedData.app_institution,
                                fetchedData.app_address,
                                formattedDate,
                            ],
                            (err, result) => {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve(result.insertId)
                                }
                            }
                        )
                    })
                }

                insertMemberSettings()
                    .then((settingsId) => {
                        const memberId = uniqueId.uniqueIdGenerator()
                        const membertype =
                            fetchedData.app_type === 'Enabler' ? 2 : 1

                        generateAndHash()
                            .then((result) => {
                                // console.log(
                                //     'Random Digits:',
                                //     result.randomDigits
                                // )

                                db.query(
                                    `INSERT INTO member_i (member_id, member_type, member_datecreated, member_contact_id, member_setting,member_accesskey,member_password) VALUES (?, ?, ?, ?, ?,?,?)`,
                                    [
                                        memberId,
                                        membertype,
                                        formattedDate,
                                        contactId,
                                        /* Use settingsId here */ settingsId,
                                        result.hashedSHA,
                                        result.hashedBcrypt,
                                    ],
                                    (err, data) => {
                                        if (err) {
                                            console.error(
                                                'Error inserting into member_i:',
                                                err
                                            )
                                        } else {
                                            console.log(
                                                'Data inserted successfully:',
                                                data
                                            )
                                        }
                                    }
                                )
                            })
                            .catch((error) => {
                                console.error('Error:', error)
                            })
                    })
                    .catch((error) => {
                        console.error(
                            'Error inserting into member_settings:',
                            error
                        )
                    })

                db.query(
                    `DELETE FROM application_i WHERE app_id = ${appId}`,
                    (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    }
                )
            })

            return res.status(200).json(insertedData)
        }

        // return res.status(200).json(apps)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

module.exports = {
    uploadDocuments,
    getApplications,
    getApplicationDetails,
    setApprovalStatus,
    getApplicationUploads,
}

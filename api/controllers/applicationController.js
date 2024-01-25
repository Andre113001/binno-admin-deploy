const db = require('../../database/db')

//Middlewares
const sanitizeId = require('../middlewares/querySanitizerMiddleware')
const uniqueId = require('../middlewares/uniqueIdGeneratorMiddleware')
const { generateAndHash } = require('../middlewares/randomGenerator')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

const uploadDocuments = async (req, res) => {
    try {
        // Assuming you have the applicationId available in your request or somewhere
        const { id, email, institution, address, type, classification } =
            req.body // Replace with your logic to get the applicationId

        // Path to the destination folder
        const destinationFolder = `./private/docs/application/${id}`

        // Create the destination folder if it doesn't exist
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true })
        }

        // Process each uploaded file
        req.files.forEach((file, index) => {
            const originalName = file.originalname
            const ext = path.extname(originalName)

            // Generate a new file name based on the applicationId
            const newFileName = `${String(id)}_${index + 1}${String(ext)}`

            // Move the file to the destination folder
            fs.writeFileSync(
                path.join(destinationFolder, newFileName),
                file.buffer
            )
        })

        // Insert into the database after files have been successfully uploaded
        db.query(
            'INSERT INTO application_i (app_id, app_dateadded, app_institution, app_email, app_address, app_type, app_class, app_docs_path) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)',
            [
                id,
                institution,
                email,
                address,
                type,
                classification,
                destinationFolder,
            ],
            (insertError, insertResult) => {
                if (insertResult.affectedRows > 0) {
                    return res.json({ result: true })
                } else {
                    return res.json({ result: false })
                }
            }
        )
    } catch (error) {
        console.error('Error uploading documents:', error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
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

    const appDocsPath = path.resolve(`./private/docs/application/${appId}`)

    // Check if the directory exists
    if (fs.existsSync(appDocsPath) && fs.statSync(appDocsPath).isDirectory()) {
        // Read the contents of the directory
        fs.readdir(appDocsPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err)
                res.status(500).send('Internal Server Error')
                return
            }

            // Send the list of files as a response
            res.json({ files })
        })
    } else {
        // Directory not found
        res.status(404).send('Directory not found')
    }
}

const getImageBlob = (imagePath) => {
    return fs.readFileSync(imagePath)
}

const getFile = async (req, res) => {
    const { appId, fileName } = req.params
    const appDocsPath = path.resolve('./private/docs/application')
    const filePath = path.join(appDocsPath, appId, fileName)
    console.log(appDocsPath)

    const mimeType = mime.lookup(fileName)

    if (mimeType) {
        if (mimeType.includes('image')) {
            const img = getImageBlob(filePath)
            res.send(img)
        } else if (mimeType.includes('pdf')) {
            if (fs.existsSync(filePath)) {
                res.contentType('application/pdf')

                res.sendFile(filePath)
            } else {
                // File not found
                res.status(404).send('File not found')
            }
        } else {
            // Unsupported file type
            res.status(400).send('Unsupported file type')
        }
    } else {
        // Unable to determine MIME type
        res.status(400).send('Unable to determine file type')
    }
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
        if (!isApproved) {
            const fetchedData = await new Promise((resolve, reject) => {
                db.query(
                    `DELETE FROM application_i WHERE app_id = ?`,
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

            let email = fetchedData.app_email
            let app_institution = fetchedData.app_institution
            let access_key = ''
            let member_password = ''

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
                        } else {
                            resolve(data)
                        }
                    }
                )

                const insertMemberSettings = () => {
                    return new Promise((resolve, reject) => {
                        db.query(
                            `INSERT INTO member_settings (setting_bio, setting_institution, setting_address, setting_datecreated, setting_status, setting_profilepic) VALUES ('Welcome to BiNNO!',?, ?, ?, '1', '')`,
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

                db.query(
                    `DELETE FROM application_i WHERE app_id = ?`,
                    [appId],
                    (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    }
                )

                insertMemberSettings()
                    .then((settingsId) => {
                        const memberId = uniqueId.uniqueIdGenerator()
                        const membertype =
                            fetchedData.app_type === 'Enabler' ? 2 : 1

                        generateAndHash()
                            .then((result) => {
                                access_key = result.hashedSHA
                                member_password = result.hashedBcrypt
                                console.log({ access_key, member_password })
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
                                            reject(err)
                                        } else {
                                            console.log(
                                                'Data inserted successfully:',
                                                data
                                            )

                                            resolve(data)
                                        }
                                    }
                                )
                                // console.log(result)

                                return res.status(200).json({
                                    email: email,
                                    access_key: access_key,
                                    member_password: member_password,
                                    institution: app_institution,
                                    unhashed: result.randomDigits,
                                })
                            })
                            .catch((error) => {
                                console.log('Error:', error)
                            })
                    })
                    .catch((error) => {
                        console.log(
                            'Error inserting into member_settings:',
                            error
                        )
                    })
            })
        }

        // return res.status(200).json(apps)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error })
    }
}

module.exports = {
    uploadDocuments,
    getApplications,
    getApplicationDetails,
    setApprovalStatus,
    getApplicationUploads,
    getFile,
}

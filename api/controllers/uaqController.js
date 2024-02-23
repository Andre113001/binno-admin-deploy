const db = require('../../database/db');
const uniqueId = require("../middlewares/uniqueIdGeneratorMiddleware");

/**
* Retrieves all user asked questions (UAQs) from the database.
*
* @returns {Object} The HTTP response containing the retrieved UAQs or an error message.
*/
const getAllUaq = async (request, response) => {
	console.log(`getAllUaq() from ${request.ip}`);
	try {
		const getAllUaqQuery = `
			SELECT * FROM uaq
			WHERE archive = 0
			ORDER BY date_created
		`;
		db.query(getAllUaqQuery, [], (err, result) => {
			if (err) {
				console.error(err);
				return response.status(500).json(err)
			}

			if (result.length > 0) {
				return response.status(200).json(result)
			}
			else {
				console.error(err);
				return response.status(500).json(err)
			}
		})
	}
	catch (error) {
		console.error(error);
		return response.status(500).json(error)
	}
}

/**
* Creates a new user asked question (UAQ) in the database.
*
* req.body - { question, answer }
* @returns {Object} The HTTP response indicating success or failure in creating the UAQ.
*/
const createUaq = async (req, res) => {
	console.log(`createUaq() from ${req.ip}`);
	const { question, answer } = req.body;

	try {
		const uaqId = uniqueId.uniqueIdGenerator();
		const createUaqQuery = `
			INSERT INTO uaq(
				uaq_id,
				question,
				answer,
				date_created
			)
		   VALUES (?, ?, ?, NOW())
		`;
		db.query(createUaqQuery, [uaqId, question, answer], (error, result) => {
			if (error) {
				console.error(error);
				return res.status(500).json({ error: "Failed to create UAQ" });
			}
			else {
				console.log(`UAQ (${uaqId}) created successfully`);
				return res.status(200).json({ success: "UAQ created successfully" });
			}
		});
	}
	catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

/**
* Updates an existing user asked question (UAQ) in the database
*
* req.body - { uaqId, question, answer }
* @returns {Object} The HTTP response indicating success or failure in updating the UAQ.
*/
const updateUaq = async (req, res) => {
	console.log(`updateUaq() from ${req.ip}`);
	const { uaqId, question, answer } = req.body

	try {
		const uaqExist = await getUaqId(uaqId);
		if (uaqExist.length > 0) {
			const updateUaqQuery = `
				UPDATE uaq SET
				question = ?,
				answer = ?,
				date_modified = NOW()
				WHERE uaq_id = ?
			`;
			db.query(updateUaqQuery, [question, answer, uaqId], (error, result) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: "Failed to update uaq" });
				}
				else {
					console.log(`UAQ (${uaqId}) successfully update in uaq`);
					return res.status(200).json({ success: 'UAQ updated successfully' });
				}
			});
		}
		else {
			console.log(`UAQ (${uaqId}) does not exist`);
			return res.status(500).json({ error: "UAQ does not exist" });
		}
	}
	catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

/**
* Updates an existing user asked question (UAQ) in the database to be archive
*
* req.body - { uaqId }
* @returns {Object} The HTTP response indicating success or failure in archiving the UAQ.
*/
const deleteUaq = async (req, res) => {
	console.log(`deleteUaq() from ${req.ip}`);
	const { uaqId } = req.body;

	try {
		const uaqExist = await getUaqId(uaqId);
		if (uaqExist.length > 0) {
			const deleteUaqQuery = `
				UPDATE uaq SET
				archive = 1
				WHERE uaq_id = ?
			`;
			db.query(deleteUaqQuery, uaqId, (err, result) => {
				if (err) {
					console.error(err);
					return res.status(500).json({ error: 'UAQ delete failed' });
				}
				else {
					console.log(`UAQ (${uaqId}) successfully deleted in faq`);
					return res.status(200).json({ success: 'UAQ deleted successfully' });
				}
			});
		}
		else {
			console.log(`UAQ (${uaqId}) does not exist`);
			return res.status(500).json({ error: 'UAQ does not exist' });
		}
	}
	catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

/**
* Retrieves a user asked question (UAQ) from the database based on its ID.
*
* @param {string} uaqId - The unique identifier of the UAQ to retrieve.
* @returns {Promise<Array>} A Promise that resolves to an array containing the retrieved UAQ or rejects with an error.
*/
const getUaqId = async (uaqId) => {
	console.log(`getUaqId(${uaqId})`);
	return new Promise((resolve, reject) => {
		const getFaqIdQuery = "SELECT * FROM uaq WHERE uaq_id = ?";
		db.query(getFaqIdQuery, [uaqId], (err, result) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(result);
			}
		});
	});
}

module.exports = {
	getAllUaq,
	createUaq,
	updateUaq,
	deleteUaq
}

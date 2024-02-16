const db = require('../../database/db');
const uniqueId = require("../middlewares/uniqueIdGeneratorMiddleware");

const getAllUaq = async (request, response) => {
	console.log("getAllUaq()");
	try {
		const getAllUaqQuery = "SELECT * FROM uaq";
		db.query(getAllUaqQuery, [], (err, result) => {
			if (err) {
				console.error(err);
				return response.status(500).json(err)
			}

			if (result.length > 0) {
				return response.status(200).json(result)
			} else {
				console.error(err);
				return response.status(500).json(err)
			}
		})
	} catch (error) {
		console.error(error);
		return response.status(500).json(error)
	}
}

const createUaq = async (req, res) => {
	console.log("createUaq()");

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
				console.log("UAQ successfully stored in uaq");
				return res.status(200).json({ success: "UAQ created successfully" });
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

const updateUaq = async () => {
	console.log("editUaq()");

}

const deleteUaq = async () => {
	console.log("deleteUaq()");

}

const getUaqId = async (uaqId) => {

}

module.exports = {
	getAllUaq,
	createUaq,
	updateUaq,
	deleteUaq
}

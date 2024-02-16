const db = require('../../database/db');

const getAllUaq = async (request, response) => {
	console.log("getAllUaq()");
	try {
		const getAllUaqQuery = "SELECT * FROM uaq";
		db.query(getAllUaqQuery, [], (err, result) => {
			if (err) {
				return response.status(500).json(err)
			}

			if (result.length > 0) {
				return response.status(200).json(result)
			} else {
				return response.status(500).json(err)
			}
		})
	} catch (error) {
		return response.status(500).json(error)
	}
}

const createUaq = async () => {
	console.log("createUaq()");

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

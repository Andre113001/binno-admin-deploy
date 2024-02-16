const db = require('../../database/db');

const getAllFaq = async (request, response) => {
	console.log("getAllFaq()");
	try {
		const getAllFaqQuery = "SELECT * FROM faq";
		db.query(getAllFaqQuery, [], (err, result) => {
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

const createFaq = async () => {
	console.log("createFaq()");

}

const updateFaq = async () => {
	console.log("editFaq()");

}

const deleteFaq = async () => {
	console.log("deleteFaq()");

}

const getFaqId = async (faqId) => {

}

module.exports = {
	getAllFaq,
	createFaq,
	updateFaq,
	deleteFaq
}

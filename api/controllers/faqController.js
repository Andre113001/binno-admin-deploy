const db = require("../../database/db");
const uniqueId = require("../middlewares/uniqueIdGeneratorMiddleware");

const getAllFaq = async (request, response) => {
	console.log("getAllFaq()");
	try {
		const getAllFaqQuery = "SELECT * FROM faq";
		db.query(getAllFaqQuery, [], (err, result) => {
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

const createFaq = async (req, res) => {
	console.log("createFaq()");
	const { question, answer } = req.body;

	try {
		const faqId = uniqueId.uniqueIdGenerator();
		const createFaqQuery = `
			INSERT INTO faq(
				faq_id,
				question,
				answer,
				date_created
			)
		   VALUES (?, ?, ?, NOW())
		`;
		db.query(createFaqQuery, [faqId, question, answer], (error, result) => {
			if (error) {
				console.error(error);
				return res.status(500).json({ error: "Failed to create faq" });
			}
			else {
				console.log("FAQ successfully stored in faq");
				return res.status(200).json({ success: 'FAQ created successfully' });
			}
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

const updateFaq = async () => {
	console.log("editFaq()");

}

const deleteFaq = async () => {
	console.log("deleteFaq()");

}

const getFaqId = async (faqId) => {
	return new Promise((resolve, reject) => {
		const getFaqIdQuery = "SELECT * FROM faq WHERE faq_id = ?";
		db.query(getFaqIdQuery, [faqId], (err, result) => {
			if (err) {
				reject(err)
			} else {
				resolve(result)
			}
		});
	});
}

module.exports = {
	getAllFaq,
	createFaq,
	updateFaq,
	deleteFaq
}

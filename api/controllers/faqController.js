const db = require("../../database/db");
const uniqueId = require("../middlewares/uniqueIdGeneratorMiddleware");

const getAllFaq = async (request, response) => {
	console.log(`getAllFaq() from ${request.ip}`);
	try {
		const getAllFaqQuery = `
			SELECT * FROM faq
			WHERE archive = 0
			ORDER BY date_created
		`;
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
	}
	catch (error) {
		console.error(error);
		return response.status(500).json(error)
	}
}

const createFaq = async (req, res) => {
	console.log(`createFaq() from ${req.ip}`);
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
				console.log(`FAQ (${faqId}) successfully stored in faq`);
				return res.status(200).json({ success: 'FAQ created successfully' });
			}
		});
	}
	catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

const updateFaq = async (req, res) => {
	console.log(`updateFaq() from ${req.ip}`);
	const { faqId, question, answer } = req.body;

	try {
		const faqExist = await getFaqId(faqId);
		if (faqExist.length > 0) {
			const updateFaqQuery = `
				UPDATE faq SET
				question = ?,
				answer = ?,
				date_modified = NOW()
				WHERE faq_id = ?
			`;
			db.query(updateFaqQuery, [question, answer, faqId], (error, result) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: "Failed to update faq" });
				}
				else {
					console.log(`FAQ (${faqId}) successfully update in faq`);
					return res.status(200).json({ success: 'FAQ updated successfully' });
				}
			});
		}
		else {
			console.log(`FAQ (${faqId}) does not exist`);
			return res.status(500).json({ error: 'FAQ does not exist' });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

const deleteFaq = async (req, res) => {
	console.log(`deleteFaq() from ${req.ip}`);
	const { faqId } = req.body;

	try {
		const faqExist = await getFaqId(faqId);

		if (faqExist.length > 0) {
			const deleteFaqQuery = `
				UPDATE faq SET
				archive = 1
				WHERE faq_id = ?
			`;
			db.query(deleteFaqQuery, faqId, (err, result) => {
				if (err) {
					console.error(err);
					return res.status(500).json({ error: 'FAQ delete failed' });
				}
				else {
					console.log(`FAQ (${faqId}) successfully deleted in faq`);
					return res.status(200).json({ success: 'FAQ deleted successfully' });
				}
			});
		}
		else {
			console.log(`FAQ (${faqId}) does not exist`);
			return res.status(500).json({ error: 'FAQ does not exist' });
		}
	}
	catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
}

const getFaqId = async (faqId) => {
	console.log(`getFaqId(${faqId})`);
	return new Promise((resolve, reject) => {
		const getFaqIdQuery = "SELECT * FROM faq WHERE faq_id = ?";
		db.query(getFaqIdQuery, [faqId], (err, result) => {
			if (err) {
				reject(err)
			}
			else {
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

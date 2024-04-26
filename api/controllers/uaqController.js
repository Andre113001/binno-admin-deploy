const db = require('../../database/db');

const readUaq = (req, res) => {
    try {
        db.query(`SELECT * FROM uaq_i`, [], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.json(result);
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const deleteUaq = (req, res) => {
    const { uaqId } = req.body;
    try {
        db.query(`UPDATE uaq_i SET uaq_flag = 0 WHERE uaq_id = ?`, [uaqId], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.json(true);
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    
};

module.exports = {
    readUaq,
    deleteUaq
}
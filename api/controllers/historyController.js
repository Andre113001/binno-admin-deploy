const db = require('../../database/db');

const readChangeName = async (req, res) => {
    try {
        db.query(`SELECT * FROM history_i WHERE history_type = "CHANGE_NAME" ORDER BY history_datecreated DESC`, [], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }

            res.json(result);
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const readChangeClass = async (req, res) => {
    try {
        db.query(`SELECT * FROM history_i WHERE history_type = "CHANGE_CLASS" ORDER BY history_datecreated DESC`, [], (err, result) => {
            if (err) {
                console.log(err);
                return;
            }

            res.json(result);
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = {
    readChangeName,
    readChangeClass
}
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


const uploadUaq = (req, res) => {
    const { email, content } = req.body;
  
    try {
      db.query(`INSERT INTO uaq_i (uaq_dateadded, uaq_email, uaq_content) VALUES (NOW(), ?, ?)`, [email, content], (err, result) => {
        if (err) {
          console.error('Error adding FAQ:', err);
          res.status(500).json({ message: 'Error adding FAQ' }); 
        } else {
          res.json('Upload is complete');
        }
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'Internal server error' }); 
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
    deleteUaq,
    uploadUaq
}
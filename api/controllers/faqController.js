const db = require('../../database/db'); 

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

const uploadFaq = (req, res) => {
  const { title, content } = req.body;

  try {
    db.query(`INSERT INTO faq_i (faq_datecreated, faq_title, faq_content) VALUES (NOW(), ?, ?)`, [title, content], (err, result) => {
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

const readFaq = (req, res) => {
    try {
        db.query(`SELECT * FROM faq_i`, [], (err, result) => {
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
}


const editFaq = (req, res) => {
  // Destructuring request body to get parameters
  const { title, content, faqId } = req.body;

  try {
    // Database query to update FAQ entry
    db.query(
      `UPDATE faq_i SET faq_title = ?, faq_content = ? WHERE faq_id = ?`,
      [title, content, faqId],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          res.json({ message: 'Faq updated successfully!', updatedFaq: {} });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteFaq = (req, res) => {
    const { faqId } = req.body;

    try {
        db.query(`UPDATE faq_i SET faq_flag = 0 WHERE faq_id = ?`, [faqId], (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.json("Faq is deleted.");
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = {
    uploadFaq,
    readFaq,
    editFaq,
    deleteFaq
}
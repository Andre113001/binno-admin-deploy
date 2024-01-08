// getRoute.js
const express = require('express');
const router = express.Router();
const db = require('../../database/db');


router.get('/', (req, res) => {
    res.send('Hello, World');
});
  
router.get('/users', async (req, res) => {
    db.query('SELECT * FROM member_i INNER JOIN member_contact ON member_contact.contact_id = member_i.member_contact_id INNER JOIN email_i ON email_i.email_id = member_contact.contact_email', (err, result) => {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

router.get('/app-requests', async (req, res) => {
    db.query("SELECT * FROM request_i", (err, result) => {
        if (err ) {
            console.err(err);
        } else {
            console.log(result);
            res.send(result);
        }
    });
});
  
  module.exports = router;
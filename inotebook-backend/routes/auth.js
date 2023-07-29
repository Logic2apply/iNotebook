const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const router = express.Router()

const JWT_SECRET = "lajknalfoaijfgoinaonfgoehiasi"

// Make user using post request on /api/auth/createuser
router.post('/createuser/', [
    body('name', 'Enter a valid name').isLength({ min: 3, max: 25 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 8 character long').isLength({ min: 8 })
], async (req, res) => {

    // Check for errors and return errors if they exists
    const result = validationResult(req);
    if (result.isEmpty()) {
        try {
            // Check wether a user exists with same email already
            let user = await User.findOne({ email: req.body.email }).exec();
            if (user) {
                return res.status(400).json({ error: "Sorry a user with this email already exists!", user: user })
            } else {
                // create user if it doesn't exists
                const salt = await bcrypt.genSalt(10)
                const secPass = await bcrypt.hash(req.body.password, salt)
                user = await User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: secPass
                })

                const data = {
                    user: {
                        id: user.id
                    }
                }
                const authToken = jwt.sign(data, JWT_SECRET)
                // console.log(jwtData);
                return res.json({authToken})
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: error })
        }
    } else {
        return res.send({ errors: result.array() });
    }

})

module.exports = router
import { mailServices } from '../services/index'

const getHomePage = async (req, res) => {
    try {
        return res.render('homepage.ejs', {
            data: JSON.stringify({})
        })
    } catch (err) {
        console.log(err)
    }
}

const sendMail = async (req, res) => {
    try {
        const message = await mailServices.sendSimpleEmail(req.body.email, 'Test Nodemailer', '<b>Test Nodemailer</b>', 'Test Nodemailer')
        return res.status(200).json({
            message
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            error
        })
    }
}


module.exports = {
    name: 'homeController',
    getHomePage: getHomePage,
    sendMail
}
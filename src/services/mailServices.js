"use strict"
require('dotenv').config()
const nodemailer = require("nodemailer");
import { messageCreater } from './untilsServices'

/**
 * 
 * @param {(string|Array)} toEmails - Emails need to be sent email
 * @param {string} subject - A string represent title of email
 * @param {string} html - A string format like html 
 * @param {string} text - A string represent body of email 
 * @returns {Promise} 
 */
async function sendSimpleEmail(toEmails, subject = '', html = '', text = '') {
    return new Promise(async (resolve, reject) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_APP, // generated ethereal user
                pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
            },
        });

        let listEmails = toEmails
        if (listEmails.constructer === Array) {
            listEmails = toEmails.join(', ')
        }

        // send mail with defined transport object
        await transporter.sendMail({
            from: `"Product Move" <${process.env.EMAIL_APP}>`, // sender address
            to: listEmails, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
        }).then((success) => {
            resolve(messageCreater(1, 'success', `Send email to ${listEmails} successful`))
        }).catch((error) => {
            reject(-6, 'error', 'Internal server error')
        })
    })

}



module.exports = {
    name: 'mailServices',
    sendSimpleEmail
}
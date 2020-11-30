/**
 *      on 7/24/16.
 */
import conf from "./config";
import * as Mailgen from "mailgen";
import * as NodeMailer from "nodemailer";
import * as DirectTransport from "nodemailer-direct-transport";
import {Promise} from "thenfail";

export class Mailer {
    private generator: Mailgen;
    private transport: any;
    private email: string;
    private opts: any;

    constructor(opts) {
        opts = opts || {};
        this.opts = {direct: true};
        if (opts.email != null && opts.email !== "") {
            this.email = opts.email;
        } else {
            this.email = "";
        }

        if (opts.service != null && opts.service !== "") {
            this.opts.service = opts.service;
        } else if (opts.port != null && opts.host != null) {
            this.opts.port = opts.port;
            this.opts.host = opts.host;
            this.opts.direct = false;
        }

        if (opts.auth != null) {
            this.opts.auth = {};
            if (opts.auth.user != null && opts.auth.user !== "") {
                this.opts.auth.user = opts.auth.user;
            } else {
                this.opts.auth.user = "";
            }
            if (opts.auth.pass != null && opts.auth.pass !== "") {
                this.opts.auth.pass = opts.auth.pass;
            } else {
                this.opts.auth.pass = "";
            }
            this.opts.direct = false;
        }

        if (!this.opts.direct) {
            if (opts.secure != null) {
                this.opts.secure = opts.secure;
            }
        }

        this.generator = new Mailgen({
            theme: "default",
            product: {
                name: "Aladdin Street",
                link: " ",
                logo: " "

            },
        });
        if (this.opts.direct) {
            this.transport = NodeMailer.createTransport(DirectTransport({}));
        } else {
            this.transport = NodeMailer.createTransport(this.opts);
        }
    }

    public generateHtml(jsonContent) {
        if (!jsonContent) {
            return Promise.reject(new Error("Invalid parameters."));
        }

        return this.generator.generate(jsonContent);
    }

    public newUser(toName, toEmail, password) {
        let message = {
            body: {
                name: toName,
                intro: "Please find below login credential :<br/> Email : "+toEmail+"<br/>Password : "+password+"",
                outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
            },
        };

        return this.send(toEmail, "Welcome", message);
    }

    public send(toEmail, title, jsonContent, attachments = []): Promise<any> {
        if (!this.transport) {
            return Promise.reject(new Error("Email Error: No e-mail transport configured."));
        }

        let message = {
            from: this.email,
            to: toEmail,
            subject: title,
            html: this.generator.generate(jsonContent),
        };
        if(attachments.length){
            //message.attachments = attachments
        }
        return new Promise((resolve, reject) => {
            try {
                this.transport.sendMail(message, (error, response: any) => {
                    if (error) {
                        return reject(error);
                    }

                    if (this.transport.transportType !== "DIRECT") {
                        return resolve(response);
                    }

                    response.statusHandler.once("failed", data => {
                        let reason = "Failed sending email";
                        let code = "EMAIL_FAILED";
                        if (data.error.errno === "ENOTFOUND") {
                            reason += ",there is no mail server at this address: " + data.domain;
                            code = "EMAIL_SERVER_NOT_FOUND";
                        }
                        reason += ".";
                        let err: any = new Error(reason);
                        err.code = code;
                        return reject(err);
                    });

                    response.statusHandler.once("requeue", data => {
                        let err: any = new Error("Message was not sent, requeued. Probably will not be sent.\nMore info: " + data.error.message);
                        err.code = "EMAIL_REQUEUE";
                        return reject(err);
                    });

                    response.statusHandler.once("sent", () => {
                        return resolve("Message was accepted by the mail server. Make sure to check inbox and spam folders.");
                    });
                });
            } catch (err) {
                return reject(err);
            }
        });
    }

    public resetPassword(toEmail, name, link) {
        let message = {
            body: {
                name: name,
                intro: "You have received this email because a password reset request for your account was received.",
                action: {
                    instructions: "Click the button below to reset your password:",
                    button: {
                        color: "red",
                        text: "Reset your password",
                        link: link,
                    },
                },
                outro: "If you did not request a password reset, no further action is required on your part.",
            },
        };

        return this.send(toEmail, "Reset Password for Aladdin Street", message);
    }

    public resendPin(toEmail, name, pin) {
        let message = {
            body: {
                name: name,
                intro: "You have received this email because a new activation code request for your account was received.",
                action: {
                    instructions: "Please use this new activation code in your app:",
                    button: {
                        color: "green",
                        text: pin,
                    },
                },
                outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
            },
        };

        return this.send(toEmail, "Reset Password", message);
    }

    public sendPin(toEmail, name, pin) {
        let message = {
            body: {
                name: name,
                intro: "Welcome!  We’re very excited to have you on board.",
                action: {
                    instructions: "To get started, please input this activation code in your app:",
                    button: {
                        color: "green",
                        text: pin,
                    },
                },
                outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
            },
        };

        return this.send(toEmail, "Reset Password", message);
    }

    public sendStoreApproval(toEmail, name) {
        let message = {
            body: {
                name: name,
                intro: "You have a new Store Approval request. Please review it by logging into your portal.",
                outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
            },
        };

        return this.send(toEmail, "Message", message);
    }

    public sendPaymentSuccessEmail(toEmail, plan_name, plan_duration, paid_from, subscription_date, name, paid_amt, transaction_no, billing_address) {
        if(plan_duration == 1){
            plan_duration = 'Monthly';
        } else {
            plan_duration = 'Yearly';
        }
        let day = new Date(subscription_date).getDay() < 10 ? '0'+new Date(subscription_date).getDay() : new Date(subscription_date).getDay();
        let month = new Date(subscription_date).getMonth() < 10 ? '0'+new Date(subscription_date).getMonth() : new Date(subscription_date).getMonth();
        let subdate = day+"-"+month+"-"+new Date(subscription_date).getFullYear();
        let message = {
            body: {
                name: name,
                intro: "<strong>CARD TRANSACTION CONFIRMATION</strong><br>Please retain for your records.<br><br>Your transaction has been processed on behalf of Aladdin Street LLC.<br><br>"+
                "<strong>Transaction details</strong><br>Transaction for the value of: USD "+paid_amt+"<br><strong>Transaction number: </strong>"+transaction_no+"<br><br><strong>Plan Details: </strong>"+plan_name+" (Billed "+plan_duration+")<br><br><strong>Billing Information: </strong><br>"+billing_address+
                "<br><strong>Subscription Date: </strong>"+subdate,
                outro: "This is not a tax receipt.",
            },
        };

        return this.send(toEmail, "Transaction Confirmation", message);
    }

    public sendPaymentSuccessEmailToAdmin(toEmail, plan_name, plan_duration, paid_from, subscription_date, name, paid_amt, transaction_no, billing_address, customer_email) {
        if(plan_duration == 1){
            plan_duration = 'Monthly';
        } else {
            plan_duration = 'Yearly';
        }
        let day = new Date(subscription_date).getDay() < 10 ? '0'+new Date(subscription_date).getDay() : new Date(subscription_date).getDay();
        let month = new Date(subscription_date).getMonth() < 10 ? '0'+new Date(subscription_date).getMonth() : new Date(subscription_date).getMonth();
        let subdate = day+"-"+month+"-"+new Date(subscription_date).getFullYear();
        let message = {
            body: {
                name: 'Aladdin Street Admin',
                intro: "<strong>You Have New (Plus) Subscription.</strong><br>Please retain for your records.<br><br><strong>Customer Details</strong><br><strong>Name: </strong>"+
                name+"<br><strong>Email Address: </strong>"+customer_email+"<br><br>"+
                "<strong>Transaction details</strong><br>Transaction for the value of: USD "+paid_amt+"<br><strong>Transaction number: </strong>"+transaction_no+"<br><br><strong>Plan Details: </strong>"+plan_name+" (Billed "+plan_duration+")<br><br><strong>Billing Information: </strong><br>"+billing_address+
                "<br><strong>Subscription Date: </strong>"+subdate,
            },
        };

        return this.send(toEmail, "New Subscription", message);
    }

    public sendFeedBack(toEmail, toName, name, email, phone, companyName, subject, message) {
        let message = {
            body: {
                name: toName,
                intro: "<Strong>Name:</Strong> " + name + "<br/><Strong>Email:</Strong> " + email + "<br/><Strong>Phone:</Strong>  " + phone + "<br/><Strong>Company Name:</Strong> " + companyName + "<br/><Strong>Subject:</Strong> " + subject + "<br/> <Strong>Message:</Strong> " + message,
            },
        };

        return this.send(toEmail, "Message from Aladdin Street", message);
    }


    public sendNewPassword(toEmail, name, password) {
        let message = {
            body: {
                name: name,
                intro: "Your new password has been created.",
                action: {
                    instructions: "Please use this new password to login and change password as soon as possible.",
                    button: {
                        color: "blue",
                        text: password,
                    },
                },
                outro: "Need help, or have questions? Just reply to this email, we\"d love to help.",
            },
        };

        return this.send(toEmail, "Message from Aladdin Street", message);
    }

    public customEmail(toEmail, name, subject, message, attachment = null) {
        let messageBody = {
            body: {
                name: name,
                intro: message
            },
        };
        let that = this;
        if(attachment){
            let base64Image = attachment.split(';base64,').pop();
            let bitmap = new Buffer(base64Image, 'base64');
            let attachments = [{'filename': 'image.jpeg', 'content': bitmap}];
            return that.send(toEmail, subject, messageBody, attachments);
        } else{
            return this.send(toEmail, subject, messageBody);
        }

    }
}

export default new Mailer(conf.mailer);

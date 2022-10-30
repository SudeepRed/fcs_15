import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Cryptr from "cryptr";
dotenv.config();
const MAIL_SETTINGS = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};
const cryptr = new Cryptr(process.env.CRYPTR_SECRET)

const transporter = nodemailer.createTransport(MAIL_SETTINGS);

//add a secret value to time
function genrateOtp(){
    const otp =  cryptr.encrypt(Date.now());
    console.log(otp)
    return otp


}
export async function sendMail(req) {
    const otp = genrateOtp();
  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.email,
      to: req.body.email,
      subject: "Hello ✔",
      html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>Welcome.</h2>
          <h4>You are officially In ✔</h4>
          <p style="margin-bottom: 30px;">Please enter the sign up OTP to get started</p>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otp}</h1>
     </div>
      `,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
}
//remove the secret value
export function verifyOtp(req, res, next) {
    const otp = req.body.otp;
    const time = cryptr.decrypt(otp);
    const currTime = Date.now();
    const difftime = currTime - time;
    if(difftime<= 30){
        return next();
    }
    else{
        res.send("otp expired")
    }

}



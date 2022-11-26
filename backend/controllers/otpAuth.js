import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Cryptr from "cryptr";
import * as logs from "logger";
let logger = logs.createLogger("./Bhamlo.log");
dotenv.config();
const MAIL_SETTINGS = {
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};
const cryptr = new Cryptr(process.env.OTP_SECRET);

const transporter = nodemailer.createTransport(MAIL_SETTINGS);

//add a secret value to time
function genrateOtp() {
  const otp = cryptr.encrypt(Date.now());
  return otp;
}

export async function sendMail(email) {
  const otp = genrateOtp();
  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.email,
      to: email,
      subject: "OTP From Bhamlo",
      html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <p style="margin-bottom: 30px;">Please enter the sign up OTP to get started</p>
          <h1 style="font-size: 20px; letter-spacing: 2px; text-align:center;">${otp}</h1>
     </div>
      `,
    });
    return info;
  } catch (err) {
    console.log(err);
    logger.error(err);
    return false;
  }
}
//remove the secret value
export function verifyOtp(otp) {
  if (otp != undefined) {
    try {
      const time = cryptr.decrypt(otp);
      const currTime = Date.now();
      const difftime = currTime - time;
      if (difftime <= 600000) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

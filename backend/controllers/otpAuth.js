import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Cryptr from "cryptr";
import * as logs from "logger";
import * as otpGenerator from "otp-generator";
import * as db from "../db/queries.js";

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
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(otp);
  return otp;
}

export async function sendMail(email) {
  const otp = genrateOtp();
  const time = Date.now();
  try {
    await db.insertOTP(otp, time, email);
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.email,
      to: email,
      subject: "OTP From Bhamlo",
      html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <p style="margin-bottom: 30px;">Your OTP</p>
          <h1 style="font-size: 20px; letter-spacing: 2px; text-align:center;">${otp}</h1>
     </div>
      `,
    });
    logger.info("EMAIL OTP SENT", info);
    return info;
  } catch (err) {
    console.log(err);
    logger.error(err);
    return false;
  }
}
//remove the secret value
export async function verifyOtp(otp, email) {
  if (otp != undefined) {
    try {
      const time = await db.getOTPTime(otp, email);
      console.log(time);
      const currTime = Date.now();
      const difftime = currTime - time;
      if (difftime <= 60000 * 2) {
        return true;
      } else {
        logger.error("Either OTP time expired!", email);
        return false;
      }
    } catch (err) {
      return false;
    }
  } else {
    console.log("otp wrong");
    logger.error("Wrong OTP!", email);
    return false;
  }
}

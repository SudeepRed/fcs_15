import * as IPFS from "ipfs-core";
import * as fs from "fs";

let real_data = "NA";
let fake_data = "NA";
let real_data_copy = "NA";
try {
  real_data = fs.readFileSync(
    "../db/uploads/6b767ea6-9ad5-480f-898c-afd4c9eaf216.jpg"
  );
  console.log(real_data);
} catch (err) {
  console.error(err);
}
try {
  fake_data = fs.readFileSync("../db/uploads/14_5_22_BLR-DEL_Round.jpg");
  console.log(fake_data);
} catch (err) {
  console.error(err);
}
try {
  real_data_copy = fs.readFileSync(
    "../db/uploads/6b767ea6-9ad5-480f-898c-afd4c9eaf216 copy.jpg"
  );
  console.log(real_data_copy);
} catch (err) {
  console.error(err);
}

const real = await ipfs.add(real_data);
const fake = await ipfs.add(fake_data);
const realre = await ipfs.add(real_data_copy);
console.log(real);
console.log(real.path == fake.path);
console.log(realre.path == real.path);

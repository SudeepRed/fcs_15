
import * as fs from "fs";


export async function upload(ipfs ,data){
    return await ipfs.add(data);
}
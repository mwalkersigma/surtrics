import {parse} from 'csv-parse';
import fs from 'fs';
import {PromisePool} from "@supercharge/promise-pool";
import Db from "../../../db";





async function processCSVTransaction(){
    return new Promise((resolve, reject) => {
        let records = [];

        const filePath = "./src/csv/TransactionHistory-8_24_2023 1_10 PM.csv";

        const parser = parse({
            delimiter: ','
        });
        fs.createReadStream(filePath).pipe(parser);
        const convertToResponseObject = record => {
            const [
                ,
                TransactionDate,
                User,
                TransactionType,
                Code,
                Sku,
                ScannedCode,
                SerialNumbers,
                LotNumber,
                Title,
                ,
                ,
                ,
                TransactionReason,
                ,
                ,
                ,
                Location,
                ,
                ,
                Quantity,
                QuantityBefore,
                QuantityAfter,
                TransactionNote
            ] = record
            return {
                TransactionDate,
                User,
                TransactionType,
                ScannedCode,
                Code,
                Sku,
                SerialNumbers,
                TransactionReason,
                LotNumber,
                Title,
                Location,
                Quantity,
                QuantityBefore,
                QuantityAfter,
                TransactionNote,
                Context:null
            }
        }

        const convertToDatabase = (data) => {
            return [
                data['User'],
                data['Sku'],
                data['Code'],
                data['ScannedCode'],
                data['LotNumber'],
                data['Title'],
                data['Quantity'],
                data['QuantityBefore'],
                data['QuantityAfter'],
                data['Location'],
                data['SerialNumbers'],
                data['TransactionType'],
                data['TransactionReason'],
                data['TransactionNote'],
                data['TransactionDate'],
                data['Context']
            ]
        }


        parser.on('readable', function () {
            let record;
            while (record = parser.read()) {
                let item  = record;
                item = convertToResponseObject(item);
                item = convertToDatabase(item);
                records.push(item);
            }
        });

        parser.on('error', function (err) {
            console.error(err)
        })

        parser.on('close', async () => {
            let slice = records.splice(0,1);
            await PromisePool
                .withConcurrency(100)
                .for(records)
                .process(async (item) => {
                    console.log("Inserting Record for sku: ", item[14])
                    await Db.query(`
                                INSERT INTO nfs.surtrics.surplus_metrics_data ("user", sku, code, scanned_code, lot_number,
                                                                               title, quantity,
                                                                               quantity_before, quantity_after, location,
                                                                               serial_numbers,
                                                                               transaction_type, transaction_reason,
                                                                               transaction_note,
                                                                               transaction_date, context)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                        item)
                    console.log("INSERTED Record for sku: ", item[14])
                })
            resolve("success")
        })
    })
}


export default function handler (req,res) {
    return processCSVTransaction()
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}
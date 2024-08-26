import db from "../../../../db/index"
import getStartAndEndWeekString from "../../../../modules/utils/getStartAndEndWeekString";
import Query from "../../../../modules/classes/query";
import {parseBody} from "../../../../modules/serverUtils/parseBody";


async function getIncrements(startWeek,endWeek,interval){

    let myQuery = new Query(
        "surtrics.surplus_metrics_data",
        [
            "sum(quantity)",
            '"user" as name',
            "transaction_type as type",
            "transaction_reason as reason"
        ]
    )
        .conditional(interval,
        (q)=>q.addAggregate(`DATE_TRUNC('@', transaction_date) as date`,interval),
        (q)=>q.addColumn(`DATE_TRUNC('day',transaction_date) as date`
        ))
        .addWhere('"user"', "!=", "BSA")
        .addWhere("DATE(transaction_date)", ">=", startWeek)
        .addWhere("DATE(transaction_date)", "<=", endWeek)
        .addWhere("transaction_type", "=", "Add")
        .addWhereWithOr([
            {column:"transaction_reason", operator:"=", value:"Relisting"},
            {column:"transaction_reason", operator:"=", value:"Add"},
            {column:"transaction_reason", operator:"=", value:"Add on Receiving"}
        ])
        .addGroupBy("name")
        .addGroupBy("type")
        .addGroupBy("reason")
        .addGroupBy("date")

    console.log(myQuery.getParsedQuery())
    return await myQuery.run(db, console.log).then(({rows})=>rows);
}


export default function handler (req,res) {
    let startDate, endDate, interval;

    let body = parseBody(req);
    if(body?.date){
        let [startWeek, endWeek] = getStartAndEndWeekString(new Date(body.date));
        startDate = startWeek;
        endDate = endWeek;
    }else if (body?.startDate && body?.endDate) {
        startDate = body.startDate;
        endDate = body.endDate;
        interval = body?.interval ?? undefined;
    }else {
        let [startWeek, endWeek] = getStartAndEndWeekString(new Date());
        startDate = startWeek;
        endDate = endWeek;
    }

    return getIncrements(startDate,endDate,interval)
        .then((response) => {
            res.status(200).json(response)
        })
        .catch((error) => {
            res.status(500).json(error)
        })
}
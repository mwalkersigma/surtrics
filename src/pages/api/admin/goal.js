import serverAdminWrapper from "../../../modules/auth/serverAdminWrapper";
import db from "../../../db/index.js";
import router from "../../../modules/serverUtils/requestRouter";

function getHandler(req,res){
    return db.query(`
            SELECT
                goal_amount
            FROM
                surtrics.surplus_goal_data
            ORDER BY
                goal_date DESC,
                goal_id DESC
            LIMIT 1;
        `)
        .then(({rows}) => {
            return res.status(200).json(rows[0])
        })
}
function postHandler(req,res){
    let body = req.body;
    if(typeof body ==="string") body = JSON.parse(body);
    const {date,all} = body;
    if(all){
        return db.query(`
            SELECT
                *
            FROM
                surtrics.surplus_goal_data
            ORDER BY
                goal_date DESC,
                goal_id DESC;
        `)
            .then(({rows}) => {
                return res.status(200).json(rows)
            })
    }
    return db.query(`
            SELECT
                *
            FROM
                surtrics.surplus_goal_data
            WHERE
                goal_date < $1
            ORDER BY
                ABS(goal_date - $1),
                goal_id DESC
            LIMIT 1;
        `,[date])
        .then(({rows}) =>{
            if(rows.length === 0){
                return db.query(`
                        SELECT
                            *
                        FROM
                            surtrics.surplus_goal_data
                        ORDER BY
                            ABS(goal_date - $1)
                        LIMIT 1;
                    `,[date])
                    .then(({rows}) => {
                        return res.status(200).json(rows[0])
                    })
            }
            return res.status(200).json(rows[0])
        })
}
function putHandler(req,res){
    return serverAdminWrapper(async (req) => {
        let body = req.body;
        if(typeof body ==="string") body = JSON.parse(body);
        const {goal_date,goal_amount,user_who_submitted} = body;
        return db.query(`
        INSERT INTO surtrics.surplus_goal_data (goal_date, goal_amount, user_who_submitted)
        VALUES ($1,$2,$3);
        `,[goal_date,+goal_amount,user_who_submitted])
    },"admin",'surplus director')(req,res)
        .then(() => {
            return res.status(200).send("Goal Updated")
        })
        .catch((error) => {
            return res.status(500).send(error.message)
        })
}



export default router({
    GET: getHandler,
    POST: postHandler,
    PUT: putHandler,
    DELETE: null
});
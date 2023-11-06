import { componentDB } from "../../db/componentDB"

export default function handler (req,res) {
    return componentDB.query('' +
        `
SELECT 
    sum(sd.quantity_sold) as total_sales,
    sum(sd.quantity_sold * sd.sold_price) as total_revenue,
    channels
    ,sku
FROM 
    component
INNER JOIN public.sales_data sd on component.component_id = sd.component_id
WHERE 
    date_sold BETWEEN '2023-10-21' AND '2023-10-27'
GROUP BY 
    channels
         ,sku

    `)
        .then((response) => {
        res.status(200).json(response)
    })
}
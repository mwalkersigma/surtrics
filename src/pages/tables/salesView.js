import React from 'react';
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import useUpdates from "../../modules/hooks/useUpdates";
import Table from "react-bootstrap/Table";
import {format} from "date-fns";
import formatDateWithZeros from "../../modules/utils/formatDateWithZeros";


class Order {
    constructor(order) {
        this._order = order;
        this.name = order.name;
        this.orderId = order.order_id;
        this.storeId = order.store_id;
        this.paymentDate = format(new Date(order.payment_date), "MM/dd/yyyy");
        this.paymentTime = format(new Date(order.payment_date), "HH:mm:ss");
        this.orderStatus = order.order_status;
        this.sale_id = order.sale_id;
    }

    get items() {
        return this._order.items.map(this.processItem).flat();
    }

    get total() {
        return this.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
    }

    processItem(item) {
        try {
            return JSON.parse(item);
        } catch (e) {
            return JSON.parse("[" + item + "]");
        }
    }
}

const SalesView = () => {
    let [date, setDate] = React.useState(new Date());
    let sales = useUpdates("/api/views/sales/sales",{date});
    if (!sales) {
        return (<Container>
                <h1 className={"text-center my-3"}>Sales View</h1>
                <p>Loading...</p>
            </Container>)
    }
    sales = sales.map(sale => new Order(sale));
    let storeIDs = [...new Set(sales.map(sale => sale.storeId))];
    let storeSales = {};
    storeIDs.forEach(storeId => {
        storeSales[storeId] = sales.filter(sale => sale.storeId === storeId);
    });

    return (<Container>
        <h1 className={"text-center my-3"}>Daily Sales By Channel</h1>
        <div className={"mb-5"}>
            <label htmlFor="date">Date: </label>
            <Form.Control type="date" id="date" value={formatDateWithZeros(date)} onChange={e => setDate(new Date(e.target.value))}/>
        </div>
        {storeIDs.map(storeId => {
            return (<div key={storeId}>
                        <h2>Store ID: {storeId}</h2>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Sku</th>
                                    <th>Name</th>
                                    <th>Quantity</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                [...storeSales[storeId]
                                .reduce((acc,sale)=>{
                                    let items = sale.items;
                                    items.forEach(item =>{
                                        let name = item.name;
                                        let hasName = acc.has(name);
                                        if(hasName){
                                            let current = acc.get(name);
                                            current.quantity += +item.quantity;
                                            current.total += +item.quantity * +item.unitPrice;
                                            current.total = Math.ceil(current.total * 100) / 100;
                                            acc.set(name,current);
                                        }else{
                                            acc.set(name,{...item,...{total: Math.ceil(+item.quantity * +item.unitPrice * 100) / 100}});
                                        }
                                    })
                                    return acc;
                                },new Map())
                                .values()]
                                    .map(item => {
                                        return (<tr key={item.sku}>
                                            <td>{item.sku}</td>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.total}</td>
                                        </tr>)
                                    })
                            }
                            </tbody>
                        </Table>
                        <div className={"mb-5 text-end"}>
                            <p>
                                Total Quantity: {storeSales[storeId].reduce((total, sale) => total + sale.items.reduce((total, item) => total + item.quantity, 0), 0)} &nbsp;
                                Total Revenue: {Math.round(storeSales[storeId].reduce((total, sale) => total + sale.total, 0) * 100)/100}
                            </p>
                            <p>Total Orders: {storeSales[storeId].length}</p>
                        </div>
                    </div>
                    )
                    })
                    }
                </Container>);
        };

            export default SalesView;
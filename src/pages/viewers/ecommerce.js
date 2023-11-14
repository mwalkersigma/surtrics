import React from 'react';
import Container from "react-bootstrap/Container";
import useUpdates from "../../modules/hooks/useUpdates";
import {Col, FormGroup, Row, Form} from "react-bootstrap";
import {format, setDate, subMonths} from "date-fns";
import formatter from "../../modules/utils/numberFormatter";

function mapCommerceData (data,index,array) {
    let {
        big_commerce_sales,
        ebay_sales,
    } = data

    if(big_commerce_sales?.length > 0) {
        big_commerce_sales = big_commerce_sales
            .flat()
            .map((item) => {
                try {
                    return JSON.parse(item)
                } catch (e) {
                    return JSON.parse("[" + item + "]")
                }
            })
            .flat();
    }
    if(ebay_sales?.length > 0) {
        ebay_sales = ebay_sales
            .flat()
            .map((item) => {
                try {
                    return JSON.parse(item)
                } catch (e) {
                    return JSON.parse("[" + item + "]")
                }
            })
            .flat()

    }

    return{...data,...{
        big_commerce_sales,
        ebay_sales,
    }}
}


function FormattedControl (props){
    let {value,format,...rest} = props;
    if(!format){
        format = "number"
    }
    return (
        <Form.Control
            type={"text"}
            disabled
            readOnly
            {...rest}
            value={formatter(value,format)}
        />
    )
}

const Ecommerce = () => {
    const [month,setMonth] = React.useState(format(setDate(new Date(),1),"yyyy-MM-dd"));
    let ecommerceData = useUpdates("/api/views/ecommerce");

    if(ecommerceData.length === 0)return(
        <Container className={"text-center"}>
            Loading...
        </Container>
    );

    ecommerceData = ecommerceData.rows.map(mapCommerceData);


    let monthData = ecommerceData.find(({month:month_of_transaction})=>month_of_transaction === month);
    if(!monthData){
        return (
            <Container className={"text-center"}>
                Loading...
            </Container>
        )
    }

    const {
        impressions,
        big_commerce_sales,
        page_views,
        ebay_sales,
        visits,
        big_commerce_transactions,
        ebay_sales_transactions,
        new_listing_transactions,
        relisting_transactions,
        total_increments,
        shopped,
        add_to_cart,
        web_leads,
        po_avg,
        po_count,
        po_total,
    } = monthData;

    let dates = ecommerceData.map(({month})=>month).reverse();
    let ebaySales = ebay_sales?.reduce((acc,cur) => {
        let {unitPrice,quantity} = cur;
        acc += unitPrice * quantity;
        return acc;
    },0) || "No Data";

    let previousMonthDate = format(setDate(new Date(month),1),"yyyy-MM-dd");
    let previousMonthData = ecommerceData.find(({month:month_of_transaction})=>month_of_transaction === previousMonthDate);
    const {
        impressions:previousImpressions,
        page_views:previousPageViews,
        visits:previousVisits,
        ebay_sales:previousEbaySales,
    } = previousMonthData || {
        impressions:"No Data",
        page_views:"No Data",
        visits:"No Data",
        ebay_sales:"No Data",
    };

    let previousMonthEbaySales = previousEbaySales?.reduce((acc,cur) => {
        let {unitPrice,quantity} = cur;
        acc += unitPrice * quantity;
        return acc;
    },0) || "No Data";

    return (
        <Container>
            <h1>Ecommerce Viewer</h1>
            <Row>
                <FormGroup as={Col}>
                    <Form.Label>Month</Form.Label>
                    <Form.Select onChange={(e)=>setMonth(e.target.value)}>
                        {dates
                            .map((month) => <option
                            key={month}
                            value={month}>
                            {month.split("-").reduce((acc,cur,index,array) => {
                                if(index === 0){
                                    acc += cur;
                                }else if(index === 1) {
                                    acc = cur + "-" + acc
                                }
                                return acc
                            },"")}
                        </option>)}
                    </Form.Select>
                </FormGroup>
            </Row>
            <Row className={"my-3"}>
                <h2 className={"my-3"}>Ebay Traffic Data</h2>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Impression</Form.Label>
                    <FormattedControl value={impressions}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Page Views</Form.Label>
                    <FormattedControl value={page_views}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Ebay Sales</Form.Label>
                    <FormattedControl value={ebaySales} format={"currency"}/>
                </FormGroup>

                <FormGroup as={Col}>
                    <Form.Label>Monthly Sales Count</Form.Label>
                    <FormattedControl value={ebay_sales_transactions}/>
                </FormGroup>

                <FormGroup as={Col}>
                    <Form.Label>Monthly visits</Form.Label>
                    <FormattedControl value={visits}/>
                </FormGroup>
            </Row>
            <Row className={"my-3"}>
                <h2 className={"my-3"}> Ebay Month over Month</h2>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Impressions</Form.Label>
                    <FormattedControl format={"percent"} value={impressions / previousImpressions}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Page Views</Form.Label>
                    <FormattedControl format={"percent"} value={page_views / previousPageViews}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Ebay Sales</Form.Label>
                    <FormattedControl format={'percent'} value={ ebaySales/previousMonthEbaySales} />
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly visits</Form.Label>
                    <FormattedControl format={"percent"} value={visits / previousVisits}/>
                </FormGroup>
            </Row>
            <Row className={"my-3"}>
                <h2 className={"my-3"}>Purchasing Data</h2>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Purchase Total</Form.Label>
                    <FormattedControl value={po_total} format={"currency"}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>PO Average</Form.Label>
                    <FormattedControl value={po_avg} format={"currency"}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>PO Count</Form.Label>
                    <FormattedControl value={po_count}/>
                </FormGroup>
            </Row>
            <Row className={"my-3"}>
                <h2 className={"my-3"}>Listing Data</h2>
                <FormGroup as={Col}>
                    <Form.Label>New Listings</Form.Label>
                    <FormattedControl value={new_listing_transactions}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Relistings</Form.Label>
                    <FormattedControl value={relisting_transactions}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Total Listings</Form.Label>
                    <FormattedControl value={total_increments}/>
                </FormGroup>
            </Row>
            <Row className={"my-3"}>
                <h2 className={"my-3"}>Big Commerce Data</h2>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Visits</Form.Label>
                    <FormattedControl value={visits}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Shopped</Form.Label>
                    <FormattedControl value={shopped}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Add to Cart</Form.Label>
                    <FormattedControl value={add_to_cart}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly purchase</Form.Label>
                    <FormattedControl value={big_commerce_transactions}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Monthly Web Leads</Form.Label>
                    <FormattedControl value={web_leads}/>
                </FormGroup>
            </Row>
            <Row className={"my-3"}>
                <h2 className={"my-3"}>Big Commerce Stats</h2>
                <FormGroup as={Col}>
                    <Form.Label>Visited PDP page</Form.Label>
                    <FormattedControl format={"percent"} value={+shopped/+visits}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Conversion Rate</Form.Label>
                    <FormattedControl format={(add_to_cart / shopped) > .01 ? 'percent' : "number" } value={+add_to_cart/+shopped}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Closure Rate</Form.Label>
                    <FormattedControl format={"percent"} value={big_commerce_transactions/+add_to_cart}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Order Rate</Form.Label>
                    <FormattedControl value={+big_commerce_transactions/+visits}/>
                </FormGroup>
                <FormGroup as={Col}>
                    <Form.Label>Adjusted Conversion Rate</Form.Label>
                    <FormattedControl format={(add_to_cart / shopped) > .01 ? 'percent' : "number" } value={(+add_to_cart + +web_leads)/+shopped}/>
                </FormGroup>
            </Row>
            <div style={{height:"vh"}} />
        </Container>
    );
};

export default Ecommerce;
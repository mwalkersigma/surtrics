import React from 'react';
import useUpdates from "../modules/hooks/useUpdates";


const SalesBuckets = () => {
    const sales = useUpdates("/api/views/sales/usingComponent")
    console.log(sales)


    return (
        <div>

        </div>
    );
};

export default SalesBuckets;
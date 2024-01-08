function mapCommerceData(data) {
    let {
        big_commerce_sales,
        ebay_sales,
    } = data

    if (big_commerce_sales?.length > 0) {
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
    if (ebay_sales?.length > 0) {
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

    return {
        ...data,
        ...{
            big_commerce_sales,
            ebay_sales,
        }
    }
}

export default function mapEcommerceData(data) {
    if (Array.isArray(data)) {
        return data.map(mapCommerceData)
    } else {
        return mapCommerceData(data)
    }
}
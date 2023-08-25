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

export default convertToDatabase;
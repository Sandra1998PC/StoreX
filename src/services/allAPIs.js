import commonAPI from "./commonAPI"

//register

export const registerAPI = async(reqBody) => {
    return await commonAPI("POST",'/register',reqBody)
}

//login

export const loginAPI = async(reqBody) => {
    return await commonAPI("POST",'/login',reqBody)
}

//add product group
export const addProductGroupAPI = async(reqBody) => {
    return await commonAPI("POST",'/master/add-product-group',reqBody)
}

//get product group
export const getProductGroupAPI = async() => {
    return await commonAPI("GET",'/master/get-all-product-groups')
}

// update product group
export const updateProductGroupAPI = async(reqBody,id) => {
    return await commonAPI("PUT",`/master/update-product-group/${id}`,reqBody)
}

// delete product group
export const deleteProductGroupAPI = async(id) => {
    return await commonAPI("DELETE",`/master/delete-product-group/${id}`)
}

//add Tax
export const addTaxAPI = async(reqBody) => {
    return await commonAPI("POST",'/master/add-tax',reqBody)
}

//get Tax
export const getTaxAPI = async() => {
    return await commonAPI("GET",'/master/get-all-taxes')
}

// update Tax
export const updateTaxAPI = async(reqBody,id) => {
    return await commonAPI("PUT",`/master/update-tax/${id}`,reqBody)
}

// delete Tax
export const deleteTaxAPI = async(id) => {
    return await commonAPI("DELETE",`/master/delete-tax/${id}`)
}

//add Product
export const addProductAPI = async(reqBody) => {
    return await commonAPI("POST",'/master/add-product',reqBody)
}

//get Product
export const getProductAPI = async() => {
    return await commonAPI("GET",'/master/get-all-products')
}

// update Product
export const updateProductAPI = async(reqBody,id) => {
    return await commonAPI("PUT",`/master/update-product/${id}`,reqBody)
}

// delete Product
export const deleteProductAPI = async(id) => {
    return await commonAPI("DELETE",`/master/delete-product/${id}`)
}
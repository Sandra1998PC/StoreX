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
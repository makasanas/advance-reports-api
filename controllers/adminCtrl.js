

const { ApiResponse } = require('./../helpers/common');
const { handleError } = require('./../helpers/utils');
const jwt = require('jsonwebtoken');
const commonModel = require('./../model/common');

// module.exports.getUsers = async (req, res) => {
//     /* Contruct response object */
//     let rcResponse = new ApiResponse();
//     let { query } = req;
//     try {
//         let limit = query.limit ? parseInt(query.limit) : 10;
//         let skip = query.page ? ((parseInt(query.page) - 1) * (limit)) : 0;
//         let sort = { created: -1 };
//         rcResponse.data = (await commonModel.findWithCount('user', [{}], skip, limit, sort))[0];
//     } catch (err) {
//         handleError(req, err, rcResponse);
//     }
//     return res.status(rcResponse.code).send(rcResponse);
// };


module.exports.getUsers = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let { query } = req;
    try {
        let limit = query.limit ? parseInt(query.limit) : 10;
        let skip = query.page ? ((parseInt(query.page) - 1) * (limit)) : 0;
        let sort = { created: -1 };
        let searchQuery = {};
        let regEx;
        if (query.shopUrl && query.shopUrl != '') {
            regEx = new RegExp(`^${query.shopUrl}`, 'i');
            searchQuery["shopUrl"] = regEx;
            // searchQuery = { $text: { $search: '\"' + query.store + '\"' } }
        }
        if (query.email && query.email != '') {
            regEx = new RegExp(`^${query.email}`, 'i');
            searchQuery["email"] = regEx;
        }
        if (query.themeName && query.themeName != '') {
            regEx = new RegExp(`^${query.themeName}`, 'i');
            searchQuery["themeName"] = regEx;
        }
        if (query.appEnabled && query.appEnabled != '') {
            searchQuery["appEnabled"] = JSON.parse(query.appEnabled);
        }
        if (query.appVerified && query.appVerified != '') {
            searchQuery["isInitialSetupDone"] = JSON.parse(query.appVerified);
        }
        // console.log(searchQuery)
        rcResponse.data = (await commonModel.findWithCount('user', [searchQuery], skip, limit, sort))[0];
        // rcResponse.data = (await commonModel.findWithCount('user', [{}], skip, limit, sort))[0];
    } catch (err) {
        handleError(req, err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};

module.exports.generateAccessToken = async (req, res) => {
    let rcResponse = new ApiResponse();
    const { query, decoded } = req;
    try {
        const encodedData = {
            shopUrl: query.shopUrl,
            adminId: decoded.id,
            role: req.decoded.role
        };
        const token = await jwt.sign(encodedData, process.env['ADMIN_KEY']);

        rcResponse.data = { 'token': token };
    } catch (err) {
        handleError(req, err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};


// module.exports.getDeletedUsers = async (req, res) => {
//     /* Contruct response object */
//     let rcResponse = new ApiResponse();
//     let { query } = req;
//     try {
//         let limit = query.limit ? parseInt(query.limit) : 10;
//         let skip = query.page ? ((parseInt(query.page) - 1) * (limit)) : 0;
//         let sort = { created: -1 };
//         rcResponse.data = (await commonModel.findWithCount('deletedUser', [{}], skip, limit, sort))[0];
//     } catch (err) {
//         handleError(req, err, rcResponse);
//     }
//     return res.status(rcResponse.code).send(rcResponse);
// };


module.exports.getDeletedUsers = async (req, res) => {
    /* Contruct response object */
    let rcResponse = new ApiResponse();
    let { query } = req;
    try {
        let limit = query.limit ? parseInt(query.limit) : 10;
        let skip = query.page ? ((parseInt(query.page) - 1) * (limit)) : 0;
        let sort = {};
        let searchQuery = {};

        if (query.sortBy && query.sortBy != "") {
            sort[query.sortBy] = -1;
        } else {
            sort = { isJsRemoved: -1, updated: -1 }
        }

        if (query.planName && query.planName != '') {
            regEx = new RegExp(`^${query.planName}`, 'i');
            searchQuery["recurringPlanName"] = regEx;
        }
        rcResponse.data = (await commonModel.findWithCount('deletedUser', [searchQuery], skip, limit, sort))[0];
    } catch (err) {
        handleError(req, err, rcResponse);
    }
    return res.status(rcResponse.code).send(rcResponse);
};
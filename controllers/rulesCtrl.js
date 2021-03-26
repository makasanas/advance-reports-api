const { ApiResponse } = require('./../helpers/common');
const shopifyReuest = require('./../helpers/shopifyReuest.js');
const { handleError } = require('./../helpers/utils');
const commonModel = require('./../model/common');

module.exports.addNewRule = async (req, res) => {

    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        const { decoded } = req;
        req.body['shopUrl'] = decoded.shopUrl;
        req.body['userId'] = decoded.id;
        // const addrule = await ruleModel.saveRule(req.body);
        const addrule = await commonModel.create('rules', req.body);

    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};


module.exports.updateRule = async (req, res) => {

    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        const { body } = req;
        rcResponse.data = await commonModel.findOneAndUpdate('rules', { _id: body.id }, body.data);
    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};

module.exports.getAllRulesByShopUrl = async (req, res) => {

    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        const { decoded } = req;

        // rcResponse.data = await ruleModel.getRulesByshopUrl(decoded.shopUrl);
        rcResponse.data = await commonModel.find('rules', { shopUrl: decoded.shopUrl });

    } catch (err) {
        handleError(err, rcResponse);
    }
    return res.status(httpStatus).send(rcResponse);
};

module.exports.deleteRuleById = async (req, res) => {

    let rcResponse = new ApiResponse();
    let httpStatus = 200;

    try {
        const { decoded } = req;
        // const rules = await ruleModel.deleteRuleById(req.params.id);
        const rules = await commonModel.findOneAndDelete('rules', { _id: req.params.id });
        rcResponse.data = rules;

    } catch (err) {
        SetResponse(rcResponse, 500, RequestErrorMsg(null, req, err), false);
        httpStatus = 500;
    }
    return res.status(httpStatus).send(rcResponse);
};

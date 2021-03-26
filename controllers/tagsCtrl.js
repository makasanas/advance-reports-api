const { ApiResponse } = require('../helpers/common');
const shopifyReuest = require('../helpers/shopifyReuest.js');
const { handleError, sendMail, handleshopifyRequest } = require('../helpers/utils');
const mongoose = require('mongoose');

const commonModel = require('../model/common');
let proecss = false;

module.exports.generateTags = async (req, res) => {
    let tags = [];
    let rcResponse = new ApiResponse();
    try {
        const { decoded } = req;

        let shopUrl = req.get('x-shopify-shop-domain');
        // let shopUrl = 'dev-srore.myshopify.com';

        const rules = await commonModel.find('rules', { shopUrl: shopUrl });

        let prResultMain = [];

        rules.forEach(async (rule, index) => {
            if (rule.item.isArray) {
                prResultMain.push(this.handleRuleArray(rule, req));
            } else {
                prResultMain.push(this.handleRuleObject(rule, req));
            }
        });

        await Promise.all(prResultMain).then(async result => {
            result.forEach(async (element, index) => {
                element.forEach((subElement, subIndex) => {
                    !tags.includes(subElement) && subElement != null & subElement != undefined ? tags.push(subElement) : '';
                });
            });
            rcResponse.data = { tags: tags };

            let updateOrderData = {
                "order": {
                    "id": req.body.id,
                    "tags": tags.toString()
                }
            }

            // const user = await userModel.getUserByShopUrl(shopUrl);
            const user = await commonModel.findOne('user', { shopUrl: shopUrl });
            if (user) {
                let updateCount = await commonModel.updateOne('user', { _id: user._id }, { $inc: { "orderCount": 1 } });

                let orderUrl = 'https://' + shopUrl + process.env["apiVersion"] + 'orders/' + updateOrderData.order.id + '.json';

                var tag = await handleshopifyRequest('put', orderUrl, user.accessToken, updateOrderData);

                rcResponse.data = { tags: tags };
            }
        }).catch((err) => {
            throw err;
        });
    } catch (err) {
        handleError(err, rcResponse);
    }

    return res.status(rcResponse.code).send(rcResponse);
};

module.exports.getValue = function getValue(s, o) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');

    for (var i = 0; i < a.length; i++) {

        var k = a[i];
        if (o != null && o != undefined && k in o) {
            o = o[k];
        } else {
            return "not found"; //cb(false, "errorrr");
        }
    }
    return o;
}

module.exports.handleRuleArray = async (rule, req) => {
    let tagResult = [];
    let uniqueArray = [];
    let debugErr = { err_user_detail: req.body };
    try {
        let result = this.getValue(rule.item.arraySelector, req.body)
        let tmpTags = [];
        let prResult = [];

        result.forEach((element, index) => {
            let comparisonValue;
            let dynamicValue;
            comparisonValue = element[rule.item.itemSelector] ? element[rule.item.itemSelector] : '';
            if (rule.tagType == 'dynamic') {
                if (rule.item.isEditable) {
                    dynamicValue = element[rule.dynamicItem.itemSelector];
                }
            }
            prResult.push(handleType(rule, req, comparisonValue, dynamicValue));
        });
        await Promise.all(prResult).then((res) => {
            tagResult = res;
            uniqueArray = tagResult.filter(function (elem, pos) {
                return tagResult.indexOf(elem) == pos;
            });
        }).catch((err) => {
            throw { ...err, ...debugErr };
        });
    } catch (err) {
        throw err;
    }
    return uniqueArray;

}

module.exports.handleRuleObject = async (rule, req) => {
    let comparisonValue;
    let tagResult = [];
    let uniqueArray = [];
    let dynamicValue;


    try {
        if (rule.item.arraySelector != '') {
            let result = this.getValue(rule.item.arraySelector, req.body);
            comparisonValue = result[rule.item.itemSelector] ? result[rule.item.itemSelector] : '';
            if (rule.tagType == 'dynamic') {
                if (rule.item.isEditable) {
                    dynamicValue = result[rule.dynamicItem.itemSelector];
                }
            }
        } else {
            comparisonValue = req.body[rule.item.itemSelector]
            if (rule.tagType == 'dynamic') {
                if (rule.item.isEditable) {
                    dynamicValue = req.body[rule.dynamicItem.itemSelector];
                }
            }
        }
        tmpTag = await handleType(rule, req, comparisonValue, dynamicValue);
        tagResult.push(tmpTag);
    } catch (err) {
        throw err;
    }
    uniqueArray = tagResult.filter(function (elem, pos) {
        return tagResult.indexOf(elem) == pos;
    });

    return uniqueArray;
}

handleType = async (rule, req, comparisonValue, dynamicValue) => {
    let tagResult
    if (rule.item.type == 'number') {
        tagResult = await handleNumber(rule, req, comparisonValue, dynamicValue);

    } else if (rule.item.type == 'string') {
        tagResult = await handleString(rule, req, comparisonValue, dynamicValue);
    } else if (rule.item.type == 'none') {
        tagResult = await handleBoolean(rule, req, comparisonValue, dynamicValue);
    }
    return tagResult;
}

handleNumber = async (rule, req, comparisonValue, dynamicValue) => {
    let tagResult
    switch (rule.compType) {
        case 'gt':
            if (comparisonValue > parseInt(rule.compValue.compMin)) {
                tagResult = await createTag(req, rule, dynamicValue);
            } else {
                tagResult = null;
            }
            break;
        case 'lt':
            if (comparisonValue < parseInt(rule.compValue.compMax)) {
                tagResult = await createTag(req, rule, dynamicValue);
            } else {
                tagResult = null;
            }
            break;
        case 'bt':
            if (comparisonValue > parseInt(rule.compValue.compMin) && comparisonValue < parseInt(rule.compValue.compMax)) {
                tagResult = await createTag(req, rule, dynamicValue);
            } else {
                tagResult = null;
            }
            break;
        case 'eq':
            if (comparisonValue == parseInt(rule.compValue.compEqual)) {
                tagResult = await createTag(req, rule, dynamicValue);
            } else {
                tagResult = null;
            }
            break;
    }
    return tagResult;
}

handleString = async (rule, req, comparisonValue, dynamicValue) => {
    let tagResult
    switch (rule.compType) {
        case 'includes':
            if (comparisonValue.toLowerCase().includes(rule.compValue.compText.toLowerCase())) {
                tagResult = await createTag(req, rule, dynamicValue);
            } else {
                tagResult = null;
            }
            break;
        case 'eq':
            if (comparisonValue.toLowerCase() == rule.compValue.compText.toLowerCase()) {
                tagResult = await createTag(req, rule, dynamicValue);
            } else {
                tagResult = null;
            }
            break;
    }
    return tagResult;
}

handleBoolean = async (rule, req, comparisonValue, dynamicValue) => {
    let tagResult;
    if (rule.item.isEditable) {
        tagResult = await createTag(req, rule, dynamicValue);
    } else {
        rule.tagValue = comparisonValue;
        tagResult = await createTag(req, rule, dynamicValue);
    }
    return tagResult;
}

createTag = async (req, rule, dynamicValue) => {
    let tag;
    if (rule.tagType == 'dynamic') {
        let comparisonValue = dynamicValue;
        // let dynamicValue = value;

        // if (rule.item.arraySelector != '') {
        //     let result = this.getValue(rule.item.arraySelector, req.body);
        //     comparisonValue = result[rule.item.itemSelector];

        // } else {
        //     comparisonValue = req.body[rule.item.itemSelector];
        // }

        if (comparisonValue != null && comparisonValue != undefined && comparisonValue != '') {
            if (rule.tagPrefix && rule.tagSuffix) {
                tag = rule.tagPrefix + comparisonValue + rule.tagSuffix;
            } else if (rule.tagPrefix && !rule.tagSuffix) {
                tag = rule.tagPrefix + comparisonValue;
            } else if (rule.tagSuffix && !rule.tagPrefix) {
                tag = comparisonValue + rule.tagSuffix;
            } else {
                tag = comparisonValue;
            }
        }
    } else {
        tag = rule.tagValue;
    }
    return tag;
}


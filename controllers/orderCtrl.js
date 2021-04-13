const { ApiResponse, SetError } = require('./../helpers/common');
const {
  handleError,
  handleshopifyRequest,
  getPaginationLink,
} = require('./../helpers/utils');
const commonModel = require('./../model/common');
module.exports.order = require('./../schema/order');

module.exports.syncAllOrders = async decoded => {
  let rcResponse = new ApiResponse();
  try {
    let allOrders = [];
    let totalOrder = 0;

    await this.getAllOrders(
      'https://' +
        decoded.shopUrl +
        process.env.apiVersion +
        'orders.json?status=any',
      decoded,
      totalOrder,
      allOrders,
      rcResponse
    );
  } catch (err) {
    handleError(err, rcResponse);
  }

  return rcResponse;
  // return res.status(rcResponse.code).send(rcResponse);
};

module.exports.syncOrders = async (req, res) => {
  let rcResponse = new ApiResponse();
  let { decoded } = req;
  try {
    let allOrders = [];
    let totalOrder = 0;

    await this.getAllOrders(
      'https://' +
        decoded.shopUrl +
        process.env.apiVersion +
        'orders.json?status=any',
      decoded,
      totalOrder,
      allOrders,
      rcResponse
    );
  } catch (err) {
    handleError(err, rcResponse);
  }
  return res.status(rcResponse.code).send(rcResponse);
};

module.exports.getAllOrders = async (
  next,
  decoded,
  totalOrder,
  allOrders,
  rcResponse
) => {
  try {
    if (next) {
      var orderData = await handleshopifyRequest(
        'get',
        next,
        decoded.accessToken
      );
      let pagination = await getPaginationLink(orderData);

      let orders = [];

      orderData.body.orders.forEach(order => {
        let data = {};

        data = {
          userId: decoded.id,
          shopUrl: decoded.shopUrl,
          orderId: order.id,
          shopifyData: order,
        };

        orders.push({
          updateOne: {
            filter: { orderId: data.orderId },
            update: data,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        });
      });

      await commonModel.bulkWrite('order', orders);
      allOrders = allOrders.concat(orders);
      await this.getAllOrders(
        pagination.next,
        decoded,
        totalOrder,
        allOrders,
        rcResponse
      );
    } else {
      rcResponse.data = await writeData(decoded, totalOrder, allOrders);
    }
  } catch (err) {
    throw err;
  }
};

writeData = async (decoded, totalOrder, allOrders) => {
  try {
    totalOrder = allOrders.length;

    await commonModel.findOneAndUpdate(
      'user',
      { _id: decoded.id },
      { $set: { orderCount: totalOrder } }
    );

    let syncData = {
      $set: {
        shopUrl: decoded.shopUrl,
        userId: decoded.id,
        orderSync: {
          lastSync: new Date(),
          status: 'Synced',
          count: totalOrder,
        },
      },
    };

    return await commonModel.findOneAndUpdate(
      'syncDetail',
      { shopUrl: decoded.shopUrl },
      syncData
    );
  } catch (err) {
    throw err;
  }
};

module.exports.getReport = async (req, res) => {
  let rcResponse = new ApiResponse();
  let { decoded } = req;
  try {
    // user based find query
    rcResponse.data = await commonModel.groupBy('order', req.body);
  } catch (err) {
    throw err;
  }
  return res.status(rcResponse.code).send(rcResponse);
};

module.exports.updateOrder = async (req, res) => {
  let rcResponse = new ApiResponse();
  let { decoded } = req;
  try {
    // let shopUrl = req.get('x-shopify-shop-domain');
    shopUrl = 'dev-srore.myshopify.com';
    let user = await commonModel.findOne('user', { shopUrl: shopUrl });
    rcResponse.data = await commonModel.findOneAndUpdate(
      'order',
      {
        orderId: req.body.id,
        userId: user._id,
      },
      {
        $set: {
          userId: user._id,
          orderId: req.body.id,
          shopUrl: user.shopUrl,
          shopifyData: req.body,
        },
      }
    );
  } catch (err) {
    throw err;
  }
  return res.status(rcResponse.code).send(rcResponse);
};

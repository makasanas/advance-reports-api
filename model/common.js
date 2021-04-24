module.exports.user = require('./../schema/user');
module.exports.activePlan = require('./../schema/activePlan');
module.exports.emailNotification = require('./../schema/emailNotification');
module.exports.deletedUser = require('./../schema/deletedUser');
module.exports.admin = require('./../schema/admin');
module.exports.contact = require('./../schema/contact');
module.exports.order = require('./../schema/order');
module.exports.syncDetail = require('./../schema/syncDetail');

module.exports.findOne = async (collection, query, property) => {
  try {
    return await this[collection]
      .findOne(query, property)
      .lean()
      .exec();
  } catch (err) {
    throw err;
  }
};

module.exports.create = async (collection, data) => {
  try {
    return await new this[collection](data).save();
  } catch (error) {
    throw error;
  }
};

module.exports.find = async (collection, query, sort, limit, skip) => {
  try {
    return await this[collection]
      .find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);
  } catch (error) {
    throw error;
  }
};

module.exports.findOneAndUpdate = async (collection, query, data, fields) => {
  try {
    return await this[collection]
      .findOneAndUpdate(query, data, {
        fields,
        setDefaultsOnInsert: true,
        new: true,
        upsert: true,
      })
      .lean()
      .exec();
  } catch (error) {
    throw error;
  }
};

module.exports.findOneAndUpdateNew = async (collection, query, data) => {
  try {
    return await this[collection]
      .findOneAndUpdate(query, { $set: data }, { new: true })
      .lean()
      .exec();
  } catch (error) {
    throw error;
  }
};

module.exports.groupBy = async (collection, query) => {
  try {
    return await this[collection].aggregate(query);
  } catch (error) {
    throw error;
  }
};

module.exports.findWithCount = async (collection, query, skip, limit, sort) => {
  // db.getCollection('orders').aggregate([
  //   {
  //     $match: {
  //       $and: [
  //         {
  //           $expr: {
  //             $lte: [{ $toDecimal: '$shopifyData.total_price' }, 400.0],
  //           },
  //         },
  //         {
  //           $expr: {
  //             $regexFind: { input: '$shopifyData.email', regex: /alpa/ },
  //           },
  //         },
  //       ],
  //     },
  //   },
  // ]);
  try {
    return await this[collection].aggregate([
      {
        $match: {
          $and: query,
        },
        // '$match' : {
        //   $and: [
        //     { $expr: { $lte: [ '$createdAt' , ISODate('2013-07-26T18:23:37.000Z') ] }},
        //     { $expr: { $gte: [ '$createdAt' , ISODate('2013-07-26T18:23:37.000Z') ] }},
        //   ]
        // }

        // $match: {
        //   $and: [
        //     {
        //       $expr: {
        //         $lte: [{ $toDecimal: '$shopifyData.total_price' }, 400.0],
        //       },
        //     },
        //     { $regexFind: { input: '$shopifyData.email', regex: /ravi/ } },
        //   ],
        // },
      },
      { $sort: sort },
    ]);
  } catch (err) {
    throw err;
  }
};

// db.getCollection('orders').aggregate([
//   {
//     $group: {
//       _id: {
//         'Sales by Month': {
//           $month: {
//             date: '$created',
//           },
//         },
//         total: {
//             item: '$shopifyData.email',
//             'TotalAmount': {
//               $sum: {
//                 $toDecimal: '$shopifyData.total_price',
//               },
//           },
//         },
//       },
//       'Number of Orders': {
//         $sum: 1,
//       },
//       total: {
//         $push: {
//           item: '$shopifyData.email',
//           'TotalAmount': {
//             $sum: {
//               $toDecimal: '$shopifyData.total_price',
//             },
//           },
//         },
//       },
//     },
//   },
//   {
//     $group: {
//       _id : "$_id.total.item",
//       count :{  $sum: {$toDecimal : '$_id.total.TotalAmount'}}
//     }
//   }
// ]);

module.exports.deleteMany = async (collection, query) => {
  try {
    return await this[collection].deleteMany(query);
  } catch (error) {
    throw error;
  }
};

module.exports.bulkWrite = async (collection, data) => {
  try {
    return await this[collection].bulkWrite(data);
  } catch (error) {
    throw error;
  }
};

module.exports.findOneAndDelete = async (collection, query) => {
  try {
    return await this[collection]
      .findOneAndDelete(query)
      .lean()
      .exec();
  } catch (error) {
    throw error;
  }
};

module.exports.updateOne = async (collection, query, data) => {
  try {
    return await this[collection]
      .updateOne(query, data)
      .lean()
      .exec();
  } catch (error) {
    throw error;
  }
};

module.exports.deleteMany = async (collection, query) => {
  try {
    return await this[collection].deleteMany(query);
  } catch (error) {
    throw error;
  }
};

const dbSupplier = require('../../model/supplier');
const async = require('async');

//获取供应商列表
exports.getSupplier = (req, res) => {
  //当前页码
  const pageIndex = parseInt(req.body.pageIndex)-1 || 0;
  //每页显示条数
  const page = parseInt(req.body.page) || 10;

  const data = {};
  data.userId = req.session.userId;

  if(req.body.name !=='' && req.body.name !== undefined){
    data.name = new RegExp(req.body.name,"i")
  }
  if(req.body.orgName !=='' && req.body.orgName !== undefined){
    data.orgName = new RegExp(req.body.orgName,"i")
  }
  if(req.body.orgType !=='' && req.body.orgType !== undefined){
    data.orgType = req.body.orgType
  }
  if(req.body.state !=='' && req.body.state !== undefined){
    data.state = req.body.state
  }
  if(req.body.supplierCodeId !=='' && req.body.supplierCodeId !== undefined){
    data.supplierCodeId = req.body.supplierCodeId
  }

  async.parallel(
    [
      callback => {
        dbSupplier.find(data,(err, data) => {
          callback(err, data)
        }).limit(page).skip(pageIndex*page).sort({_id:-1});
      },
      callback => {
        dbSupplier.find(data,(err, data) => {
          callback(err, data.length)
        });
      }
    ],
    (err, results) => {
      if(err){
        res.json({
          result:0,
          message: '数据加载失败，请刷新后重试'
        });
        return
      }
      res.json({
        result:1,
        data: {
          total: results[1],
          rows: results[0]
        }
      })
    }
  );
};

//新增或修改供应商
exports.editSupplier = (req, res, next) => {

  let data = {};
  data.userId = req.session.userId;
  if(req.body._id){
    data = req.body;
    dbSupplier.update({_id:req.body._id},data, err => {
      if (err){
        res.json({
          result:0,
          message: '操作失败，请重试'
        });
        return
      }
      res.json({
        result:1,
        message: '恭喜您，操作成功'
      });
    });
  }else {
    for(let k in req.body){
      if(k !== '_id'){
        data[k] = req.body[k]
      }
    }
    dbSupplier.create(data, err => {
      if (err) {
        res.json({
          result:0,
          message: '操作失败，请重试'
        });
        return
      }
      res.json({
        result:1,
        message: '恭喜您，操作成功'
      })
    });

  }

};

//删除供应商
exports.delSupplier = function (req, res, next) {

  if(req.body.ids.length !== 0){
    dbSupplier.remove({"_id":{ $in: req.body.ids}},function (err) {
      if (err){
        res.json({
          result:0,
          message: '操作失败，请重试'
        });
        return
      }
      res.json({
        result:1,
        message: '恭喜您，操作成功'
      });
    });
  }

};

//审核供应商
exports.pendSupplier = function (req, res, next) {
  if(req.body._id){
    dbSupplier.update({_id:req.body._id},{"state":req.body.state},function (err) {
      if (err){
        res.json({
          result:0,
          message: '操作失败，请重试'
        });
        return
      }
      res.json({
        result:1,
        message: req.body.state === true?'恭喜您，已成功启用该供应商':'恭喜您，已成功禁用该供应商'
      });
    });
  }

};

require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")

function isUndefined(value){
  return value === undefined;
}

function isNotValidsting(value){
  return typeof value !== "string" || value.trim().length === 0 || value === ""
}

function isNotValidInteger(value){
  return typeof value !== "number" || value < 0 || value % 1 !== 0
}

const requestListener = async (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }
  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try{
      const packages = await AppDataSource.getRepository("CreditPackage").find({
        select: ["id", "name", "credit_amount", "price"]
      })
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status:"success",
        data:packages
      }))
      res.end();
    }catch(error){
      console.error(error);
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status:"error",
        message:"伺服器錯誤"
      }))
      res.end();
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on("end", async()=>{
      try{
        const data = JSON.parse(body);

  /*最後執行在IF內      
        if(!isUndefined(data.name) || !isNotValidsting(data.name) ||
            !isUndefined(data.credit_amount) || !isNotValidInteger(data.credit_amount)||
            !isUndefined(data.price) || !isNotValidInteger(data.price))
        {
          const creaditPackageRepo = await AppDataSource.getRepository("CreditPackage")   //讀取資料表
          const existPackage = await creaditPackageRepo.find(                             //找到對應資料
          {                            
            where:{
              name: data.name
            }
          })
          if(existPackage.length <= 0)
          {
            const newPackage = await creaditPackageRepo.create({
              name: data.name,
              credit_amount: data.credit_amount,
              price: data.price
            })
            const result = await creaditPackageRepo.save(newPackage)
            res.writeHead(200, headers);
            res.write(JSON.stringify({
              status: "success",
              data: result
            }))
            res.end();
          }else{
            console.log(existPackage);
            res.writeHead(409, headers);
            res.write(JSON.stringify({
              status: "failed",
              message: "資料重複"
            }))
            res.end();        
          }
        }else{
          res.writeHead(400, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end();
        }
     */   
        
        if(isUndefined(data.name) || isNotValidsting(data.name) ||
            isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount)||
            isUndefined(data.price) || isNotValidInteger(data.price))
        {
          res.writeHead(400, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "欄位未填寫正確"
          }))
          res.end();
          return  
        }

        const creaditPackageRepo = await AppDataSource.getRepository("CreditPackage")   //讀取資料表
        const existPackage = await creaditPackageRepo.find({                            //找到對應資料                         
          where:{
            name: data.name
          }
        })
        if(existPackage.length > 0)
        {
          res.writeHead(409, headers);
          res.write(JSON.stringify({
            status: "failed",
            message: "資料重複"
          }))
          res.end();
          return
        }

        const newPackage = await creaditPackageRepo.create({          //新增資料
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        })
        const result = await creaditPackageRepo.save(newPackage)
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status: "success",
          data: result
        }))
        res.end();
      }catch(error){
        console.error(error);
        res.writeHead(500, headers);
        res.write(JSON.stringify({
          status: "error",
          message: "伺服器錯誤"
        }))
        res.end();
      }
    })
  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try{
      const packageId = req.url.split('/').pop();     //擷取傳入 url 的 ID
      if(isUndefined(packageId) || isNotValidsting(packageId)){
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end();
        return
      }

      const result = await AppDataSource.getRepository("CreditPackage").delete(packageId)   //刪除
      if(result.affected === 0){                //
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end();
        return;
      }

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
      }))
      res.end();
    }catch(error){
      console.error(error);
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status:"error",
        message:"伺服器錯誤"
      }))
    }
  } else if(req.url === "/api/coaches/skill" && req.method === "GET"){
    try{
      const packages = await AppDataSource.getRepository("Skill").find({
        select:["id", "name"]
      })
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status:"success",
        data:packages
      }))
      res.end();
    }catch(error){
      console.error(error);
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status:"error",
        message:"伺服器錯誤"
      }))
      res.end();
    }
  }else if(req.url === "/api/coaches/skill" && req.method === "POST"){
    req.on("end", async() =>{
      try{
        const data = JSON.parse(body);
        if(isUndefined(data.name) || isNotValidsting(data.name)){
          res.writeHead(400, headers);
          res.write(JSON.stringify({
            status:"failed",
            message:"欄位未填寫正確"
          }))
          res.end();
          return;
        }

        const creditPackageRepo = await AppDataSource.getRepository("Skill");
        const existPackage = await creditPackageRepo.find({
          where:{
            name:data.name
          }
        })
        if(existPackage.length > 0){
          res.writeHead(409, headers({
            status:"failed",
            message:"資料重複"
          }))
          res.end();
          return;
        }

        const newPackage = await creditPackageRepo.create({
          name:data.name
        })
        const result = await creditPackageRepo.save(newPackage);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status:"success",
          data:result
        }))
        res.end();
      }catch{
        res.writeHead(500, headers);
        res.write(JSON.stringify({
          status:"error",
          message:"伺服器錯誤"
        }))
        res.end();
      }
    })
  }else if(req.url.startsWith(/api/coaches/skill) && req.method === "DELETE"){
    try{
      const packageId = req.url.split('/').pop();
      if(undefined(packageId) ||isNotValidsting(packageId)){
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status:"failed",
          message: "ID錯誤"
        }))
        res.end();
        return;
      }

      const result = await AppDataSource.getRepository("Skill").delete(packageId);
      if(result.affected === 0){
        res.writeHead(400, headers);
        res.write(JSON.stringify({
          status: "failed",
          message: "ID錯誤"
        }))
        res.end();
        return;
      }
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status:"success"
      }))
      res.end();
    }catch{
      res.writeHead(500, headers);
      res.write(JSON.stringify({
        status:"error",
        message:"伺服器錯誤"
      }))
      res.end();
    }
  }else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } else {
    res.writeHead(404, headers)
    res.write(JSON.stringify({
      status: "failed",
      message: "無此網站路由",
    }))
    res.end()
  }
}

const server = http.createServer(requestListener)

async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();

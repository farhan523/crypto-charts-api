var express = require("express");
var cors = require("cors");
const axios = require("axios");
require('dotenv').config()

var app = express();
app.use(cors());

app.get("/", (req, res, next) => {
    res.send("hello");
});

app.get("/top-gainers",async (req,res,next)=>{
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/gainers-losers?limit=1000&sort=percent_change_24h&sort_dir=desc`,
        headers: { 
          'X-CMC_PRO_API_KEY': process.env.API_KEY
        }
      };

      const result = [];
      console.log("count",Number(req.query.count))
      let max_required_cmc_rank = Number(req.query.count);
      try{
        let response = await axios.request(config);

        response.data.data.forEach((crypto) => {
              if(crypto.cmc_rank <= max_required_cmc_rank && crypto.quote.USD.percent_change_24h >= 0 && crypto.quote.USD.volume_24h > 50000){
                let obj = {
                  id : crypto.id,
                  cmc_rank : crypto.cmc_rank,
                  name : crypto.name,
                  symbol : crypto.symbol,
                  price: crypto.quote.USD.price,
                  volume_24 : crypto.quote.USD.volume_24h,
                  percent_change_24h : crypto.quote.USD.percent_change_24h
                }
                result.push(obj);
              }
          });
        console.log(result.length)
        res.status(200).json(result)
      }catch(error){
        res.send(error)
        // console.log("error while fetching top gainers",error)
      }
})

app.get("/top-loser",async (req,res,next)=>{
  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/gainers-losers?limit=1000&sort=percent_change_24h&sort_dir=asc`,
      headers: { 
        'X-CMC_PRO_API_KEY': process.env.API_KEY
      }
    };

    const result = [];
    console.log("count",Number(req.query.count))
    let max_required_cmc_rank = Number(req.query.count);
    try{
      let response = await axios.request(config);

      response.data.data.forEach((crypto) => {
            if(crypto.cmc_rank <= max_required_cmc_rank && crypto.quote.USD.percent_change_24h < 0 && crypto.quote.USD.volume_24h > 50000){
              let obj = {
                id : crypto.id,
                cmc_rank : crypto.cmc_rank,
                name : crypto.name,
                symbol : crypto.symbol,
                price: crypto.quote.USD.price,
                volume_24 : crypto.quote.USD.volume_24h,
                percent_change_24h : crypto.quote.USD.percent_change_24h
              }
              result.push(obj);
            }
        });
      console.log(result.length)
      res.status(200).json(result)
    }catch(error){
      console.log("error while fetching top gainers",error)
    }
})

app.get("/market-cap",async(req,res)=>{
    let filter = req.query['time_period'];
    console.log('time_period',filter)
    let time_start;
    let time_end;

    const today = new Date();
    const yesterday = new Date(today);
    time_end = today.toISOString().split('T')[0];

    switch(filter){
      case '1d':
        yesterday.setDate(today.getDate() - 1);
        time_start = yesterday.toISOString().split('T')[0]
        break;
      case '7d':
        yesterday.setDate(today.getDate() - 7);
        time_start = yesterday.toISOString().split('T')[0]
        break;
      case '1m':
        yesterday.setDate(today.getDate() - 30);
        time_start = yesterday.toISOString().split('T')[0]
        break;
      case '1y':
        let lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        time_start = lastYear.toISOString().split('T')[0]
        break;
        case '2y':
          let lastYears = new Date(today);
          lastYears.setFullYear(today.getFullYear() - 2);
          time_start = lastYears.toISOString().split('T')[0]
          break;
        default:
          null
    }

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/historical?count=700',
        headers: { 
          'X-CMC_PRO_API_KEY': process.env.API_KEY
        }
      };

      if(filter && filter != 'all')
          config.url = `https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/historical?count=700&time_end=${time_end}&time_start=${time_start}&interval=5m`
      if(filter == '2y' || filter == '1y')
      config.url = `https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/historical?count=700&time_end=${time_end}&time_start=${time_start}&interval=1d`

    try{
        let response = await axios.request(config);
        let result = [];
        response.data.data.quotes.forEach((item)=>{
            const unixTimestamp = new Date(item.quote.USD.timestamp).getTime();
            let obj = [
                unixTimestamp,
                item.quote.USD.total_market_cap,
            ]
            // console.log(item.quote)
            result.push(obj)
        })
        res.status(200).json(result)
    }catch(error){
        console.log("error while fetching market-cap-data",error);
    }
})

app.get("/volume24h",async(req,res)=>{
  let filter = req.query['time_period'];
  console.log('time_period',filter)
  let time_start;
  let time_end;

  const today = new Date();
  const yesterday = new Date(today);
  time_end = today.toISOString().split('T')[0];

  switch(filter){
    case '1dd':
      yesterday.setDate(today.getDate() - 1);
      time_start = yesterday.toISOString().split('T')[0]
      break;
    case '7dd':
      yesterday.setDate(today.getDate() - 7);
      time_start = yesterday.toISOString().split('T')[0]
      break;
    case '1mm':
      yesterday.setDate(today.getDate() - 30);
      time_start = yesterday.toISOString().split('T')[0]
      break;
    case '1yy':
      let lastYear = new Date(today);
      lastYear.setFullYear(today.getFullYear() - 1);
      time_start = lastYear.toISOString().split('T')[0]
      break;
      case '3yy':
        let lastYears = new Date(today);
        lastYears.setFullYear(today.getFullYear() - 2);
        time_start = lastYears.toISOString().split('T')[0]
        break;
      default:
        null
  }

  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/historical?count=700',
      headers: { 
        'X-CMC_PRO_API_KEY': process.env.API_KEY
      }
    };

    if(filter && filter != 'alll')
        config.url = `https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/historical?count=700&time_end=${time_end}&time_start=${time_start}&interval=5m`
    if(filter == '3yy' || filter == '1yy')
    config.url = `https://pro-api.coinmarketcap.com/v1/global-metrics/quotes/historical?count=700&time_end=${time_end}&time_start=${time_start}&interval=1d`


  try{
      let response = await axios.request(config);
      let result = [];
      response.data.data.quotes.forEach((item)=>{
          const unixTimestamp = new Date(item.quote.USD.timestamp).getTime();
          let obj = [
              unixTimestamp,
              item.quote.USD.total_volume_24h,
          ]
          // console.log(item.quote)
          result.push(obj)
      })
      res.status(200).json(result)
  }catch(error){
      console.log("error while fetching volume24h",error);
  }
})

app.get("/trending-crypto",async (req,res,next)=>{
  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://pro-api.coinmarketcap.com/v1/cryptocurrency/trending/latest?limit=1000`,
      headers: { 
        'X-CMC_PRO_API_KEY': process.env.API_KEY
      }
    };
    console.log(req.query.count)
    let BreakException = {};
    const result = [];
    try{
      let response = await axios.request(config);
      response.data.data.forEach((crypto,index) => {
          let obj = {
            id : crypto.id,
            cmc_rank : index + 1,
            name : crypto.name,
            symbol : crypto.symbol,
            price: crypto.quote.USD.price,
            volume_24 : crypto.quote.USD.volume_24h,
            percent_change_24h : crypto.quote.USD.percent_change_24h
          }
          result.push(obj);
          if(index == Number(req.query.count) - 1){
            
              throw BreakException;
          }
            
        });
      res.status(200).json(result)
    }catch(e){
      if (e !== BreakException) res.send(e);
      // console.log("error while fetching top gainers",error)
    }
})

app.listen(process.env.PORT || 3003,()=>{
    console.log("server listening on port 3000")
})
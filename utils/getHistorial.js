const API_URL = "https://api-ropsten.etherscan.io/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=FGVV1TVIVPSR4DGEIC9E55G2ZABUBMA4XA";
const axios = require('axios');

async function getHistorial(address){
  if (typeof address === "string" && address.length === 42){
    try {
      let response = await axios.get(API_URL.replace('{address}', address));
      // console.log(response);
      response.data.result.forEach(element => {
        element.timeStamp = new Date(element.timeStamp * 1000).toLocaleString().slice(0, 25);
        element.value = element.value / 1000000000000000000;
      });      
      return response.data.result;
    } catch (error) {
      console.error(error);
      return "Error en la consulta"
    }
  }
  return false;
}

// (async function(){
//   let a = await getHistorial("0x6Fcb75934649e3bF6C18C3A5E02b0EC632813823");
//   console.log(a);
// })();

module.exports = {getHistorial}
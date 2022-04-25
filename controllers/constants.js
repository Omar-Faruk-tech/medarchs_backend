exports.constants = {
  handleErr: (err, res) => {
    if (err.isArray) {
      const errObj = {};

      err.errors.map((error) => {
        errObj[error.path] = error.message;
      });

      return res.status(400).send(errObj);
    }

},
convertToHour: async (data) => {
  let newData = await data;
  for(let key in newData){
    // console.log(`${key}: ${data[key]}`);
    if(newData[key] == "Morning"){
      data[key] = "9 10 11 12"
    }else if(newData[key] == "Afternoon"){
      data[key] = "1 2 3 4"
    }else{
      data[key] = ""
    }
  }
  return newData;
}
}
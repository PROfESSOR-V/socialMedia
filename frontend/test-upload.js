const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function test() {
  const form = new FormData();
  form.append('file', fs.createReadStream('test.jpg'));
  try {
    const res = await axios.post('https://socialmedia-0qzd.onrender.com/api/upload', form, {
      headers: { ...form.getHeaders() }
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    if (err.response) {
       console.log("STATUS:", err.response.status);
       console.log("BODY:", err.response.data);
    } else {
       console.log(err.message);
    }
  }
}
test();

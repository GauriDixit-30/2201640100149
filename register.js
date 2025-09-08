const axios = require('axios');

async function register() {
  try {
    const response = await axios.post(
      "http://20.244.56.144/evaluation-service/register",
      {
        email: "gauridixit108@gmail.com",
        name: "Gauri Dixit",
        mobileNo: "6390737920",
        githubUsername: "GauriDixit-30",
        rollNo: "220164010049",
        accessCode: "sAWTuR"
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );
    console.log("Registration successful:", response.data);
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
  }
}

register();
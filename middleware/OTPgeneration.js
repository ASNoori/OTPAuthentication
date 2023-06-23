import otpGenerator from 'otp-generator';


const generateOTP = (req,res,next) => {
    try {
      const otp= otpGenerator.generate(6, {
          upperCaseAlphabets: false, specialChars: false,
          digits: true,
          lowerCaseAlphabets: false
      });
      // res.json({otp:otp});
      return otp;
      next();
    } catch (err) {
      
    res.send(err);
    }
  };
 
  export default generateOTP;
const jwt =require('jsonwebtoken');
const { User } = require('../models')

module.exports = (req, res, next) => {
    // console.log("auth미들웨어 사용함")
    const { authorization } = req.headers;
    // console.log(authorization); 
    const [tokenType, tokenValue] = authorization.split(' ') // authorization에 split 속성을 줘서 Bearer 과 JW토큰내용을 구분
    
    if (tokenType !== "Bearer"){
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요",
        });
        return;
    }

    try{
        const { userId } = jwt.verify(tokenValue, "1q2w3e4r1!");
        User.findByPk(userId)
        .then((user) => {
            //핵심!!! locals!!
            res.locals.user = user; // 중요!!!
            next(); // next가 반드시 호출 되어야 됨.!!
        });
    }catch (error){
        res.status(401).send({
            errorMessage: "로그인 후 사용하세요",
        });
        return;
    }
};
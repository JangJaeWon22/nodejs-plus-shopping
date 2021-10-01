const express = require("express");
const mongoose = require("mongoose");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User } = require("./models"); // ./models/index 인데 index 생략 가능
const Goods = require("./models/goods");
const Cart = require("./models/cart");
const authMiddleware = require("./middlewares/auth-middleware");


mongoose.connect("mongodb://localhost/shopping-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

//joi로 입력값 검증!
const registerUserSchema = Joi.object({
  nickname: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  confirmPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

//------------회원가입
router.post("/users", async (req, res) => {
  try {
    const { nickname, email, password, confirmPassword } = await registerUserSchema.validateAsync(req.body);

    if (password !== confirmPassword) {
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다."
      });
      return; //예외처리 다른코드가 실행되지 않게 하기 위해서
    }
    const existUsers = await User.findAll({
      where: {
        [Op.or]: [{ nickname }, { email }],
      },
    });
    if (existUsers.length) {
      res.status(400).send({
        errorMessage: '이미 가입된 이메일 또는 닉네임이 있습니다.',
      });
      return;
    }
    const user = await User.create({ email, nickname, password });
    res.status(201).send({});
  }
  catch (err) {
    // console.log(err)
    res.status(400).send({
      errorMessage: "요청한 형식이 올바르지 않습니다.",
    })
  }
});


//joi로 입력값 검증!
const authUserSchema = Joi.object({
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});

//------------로그인
router.post("/auth", async (req, res) => {
  try {
    const { email, password } = await authUserSchema.validateAsync(req.body);
    const user = await User.findOne({ where: { email, password }});
    if (!user) {
      //401은 인증 실패
      res.status(401).send({
        errorMessage: '이메일 또는 패스워드가 잘못됐습니다.',
      });
      return;
    }
    const token = jwt.sign({ userId: user.userId }, "1q2w3e4r1!");
    res.send({
      token,
    });
  } catch (err) {
    console.log(err)
    res.status(400).send({
      errorMessage: "요청한 형식이 올바르지 않습니다.",
    })
  }
});

//--------------사용자 인증
router.get("/users/me", authMiddleware, async (req, res) => {
  // console.log(res.locals);
  const { user } = res.locals;
  res.send({
    user: {
      email: user.email,
      nickname: user.nickname,
    }
  });
});

/**
 * 내가 가진 장바구니 목록을 전부 불러온다.
 */
router.get("/goods/cart", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  const cart = await Cart.find({
    userId,
  }).exec();

  const goodsIds = cart.map((c) => c.goodsId);

  // 루프 줄이기 위해 Mapping 가능한 객체로 만든것
  const goodsKeyById = await Goods.find({
    _id: { $in: goodsIds },
  })
    .exec()
    .then((goods) =>
      goods.reduce(
        (prev, g) => ({
          ...prev,
          [g.goodsId]: g,
        }),
        {}
      )
    );

  res.send({
    cart: cart.map((c) => ({
      quantity: c.quantity,
      goods: goodsKeyById[c.goodsId],
    })),
  });
});

/**
 * 장바구니에 상품 담기.
 * 장바구니에 상품이 이미 담겨있으면 갯수만 수정한다.
 */
router.put("/goods/:goodsId/cart", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { goodsId } = req.params;
  const { quantity } = req.body;

  const existsCart = await Cart.findOne({
    userId,
    goodsId,
  }).exec();

  if (existsCart) {
    existsCart.quantity = quantity;
    await existsCart.save();
  } else {
    const cart = new Cart({
      userId,
      goodsId,
      quantity,
    });
    await cart.save();
  }

  // NOTE: 성공했을때 응답 값을 클라이언트가 사용하지 않는다.
  res.send({});
});

/**
 * 장바구니 항목 삭제
 */
router.delete("/goods/:goodsId/cart", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { goodsId } = req.params;

  const existsCart = await Cart.findOne({
    userId,
    goodsId,
  }).exec();

  // 있든 말든 신경 안쓴다. 그냥 있으면 지운다.
  if (existsCart) {
    existsCart.delete();
  }

  // NOTE: 성공했을때 딱히 정해진 응답 값이 없다.
  res.send({});
});

/**
 * 모든 상품 가져오기
 * 상품도 몇개 없는 우리에겐 페이지네이션은 사치다.
 * @example
 * /api/goods
 * /api/goods?category=drink
 * /api/goods?category=drink2
 */
router.get("/goods", authMiddleware, async (req, res) => {
  const { category } = req.query;
  const goods = await Goods.find(category ? { category } : undefined)
    .sort("-date")
    .exec();

  res.send({ goods });
});

/**
 * 상품 하나만 가져오기
 */
router.get("/goods/:goodsId", authMiddleware, async (req, res) => {
  const { goodsId } = req.params;
  const goods = await Goods.findById(goodsId).exec();

  if (!goods) {
    res.status(404).send({});
  } else {
    res.send({ goods });
  }
});


app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});
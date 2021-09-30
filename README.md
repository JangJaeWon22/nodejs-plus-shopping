# 항해99 강의 공부 shoppingMall에 및 로그인 기능 구현

1. 회원가입 api 구현 (password 해시함수로 바꿔야됩니다!)
2. 로그인 api 구현
3. 회원가입 post api 구현 (querystring으로 회원 정보 유출 방지 목적)
4. 사용자 인증 api 구현
5. 사용자 인증 미들웨어 구현(models)
6. 사용자 인증을 위한 내 정보 조회 API 구현

---
# 어려웠던 점.
 1. 사용자 인증 미들웨어 구현
  - 로그인 성공 시 받은 토큰을 뜯어서 유효성 검사 진행하는 과정.
  - res.locals.user = user; 를 사용한 이유.
  - promise로 받는것을 어떻게 파악하는지.
  2. 로그인 시 JWT의 활용 
  - 로그인 성공시 JWT 토큰 반환 후 프론트엔드에서 받아서 사용 할 수 있게 하는 과정

 # 개선할 내용 및 추가 공부해야될 내용.
  1. 개선할 내용
  - 회원가입 api 부분 중 password 해시함수로 바꿔주기!

  2. 추가 공부 내용
  - promise 인지 판단하는 법
  - 미들웨어 조작법
  - return 타이밍



  # 사용 라이브러리
  1. express
  2. mongoose
  3. jwtwebtoken
  4. joi
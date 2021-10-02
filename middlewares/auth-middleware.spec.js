const authMiddleware = require('./auth-middleware');

jest.mock('../models');

const { User } = require('../models');

test('정상적인 토큰을 넣은 경우 User.findByPk가 실행된다.', () => {
  User.findByPk = jest.fn();

  authMiddleware(
    {
      headers: {
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjk5LCJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.aCRSgYeB4WYqYxOoD4NwX7P7Vj8_czaR5lqtMcTQYnk',
      },
    },
    {
      status: () => ({
        send: () => {},
      }),
      locals: {},
    }
  );

  expect(User.findByPk).toHaveBeenCalledTimes(1);
  expect(User.findByPk).toHaveBeenCalledWith(99); //UserId가 들어왔을때 정상작동 확인 /// 99를 UserId로 잡은거임.
});

test('변조된 토큰으로 요청한 경우 로그인 후 사용하세요 라는 에러 메세지가 뜬다.', () => {
  const mockedSend = jest.fn();

  authMiddleware(
    {
      headers: {
        authorization: 'Bearer ',
      },
    },
    {
      status: () => ({
        send: mockedSend,
      }),
      locals: {},
    }
  );

  expect(mockedSend).toHaveBeenCalledWith({
    errorMessage: '로그인 후 사용하세요',
  });
});

const app = require("./app");
const supertest = require("supertest");

//express 서버가 문제없이 켜지는지 테스트


test("/index.html 경로에 요청했을 때 status code가 200이여야 한다.", async () => {
    //test
    const res = await supertest(app).get("/index.html")
    expect(res.status).toEqual(200);
})

test("/test/html 경로에 요청했을 때 status code가 404여야 한다.", async () => {
    //test => 다른 홈페이지로 이동 시 404가 나오면 true
    const res = await supertest(app).get("/test.html");
    expect(res.status).toEqual(404);
})
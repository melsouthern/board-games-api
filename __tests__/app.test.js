const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app");
const request = require("supertest");
const { toBeSortedBy } = require("jest-sorted");
const apiDocuments = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200: responds with a JSON describing all the available endpoints in the API", async () => {
    const result = await request(app).get("/api").expect(200);
    expect(result.body).toEqual(apiDocuments);
  });
  test("404: responds with error message if api spelled incorrectly", async () => {
    const result = await request(app).get("/aip").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
});

describe("GET /api/categories", () => {
  test("200: responds with an array of category objects which should each have a slug and description", async () => {
    const result = await request(app).get("/api/categories").expect(200);
    expect(result.body.categories.length).toBe(4);
    result.body.categories.forEach((category) => {
      expect(category).toMatchObject({
        slug: expect.any(String),
        description: expect.any(String),
      });
    });
  });
  test("404: responds with error message if categories spelled incorrectly", async () => {
    const result = await request(app).get("/api/categraies").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if api spelled incorrectly", async () => {
    const result = await request(app).get("/aip/categories").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200: responds with the review object for the relevant review_id provided", async () => {
    const result = await request(app).get("/api/reviews/10").expect(200);
    expect(result.body.review).toEqual({
      review_id: 10,
      title: "Build you own tour de Yorkshire",
      review_body:
        "Cold rain pours on the faces of your team of cyclists, you pulled to the front of the pack early and now your taking on exhaustion cards like there is not tomorrow, you think there are about 2 hands left until you cross the finish line, will you draw enough from your deck to cross before the other team shoot passed? Flamee Rouge is a Racing deck management game where you carefully manage your deck in order to cross the line before your opponents, cyclist can fall slyly behind front runners in their slipstreams to save precious energy for the prefect moment to burst into the lead ",
      designer: "Asger Harding Granerud",
      review_img_url:
        "https://images.pexels.com/photos/258045/pexels-photo-258045.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
      votes: 10,
      category: "social deduction",
      owner: "mallionaire",
      created_at: "2021-01-18T10:01:41.251Z",
      comment_count: "0",
    });
  });
  test("404: responds with error message if reviews spelled incorrectly", async () => {
    const result = await request(app).get("/api/reeviews/10").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if review_id number not found", async () => {
    const result = await request(app).get("/api/reviews/990000").expect(404);
    expect(result.body.msg).toBe(
      "Not Found - review_id provided is non-existent"
    );
  });
  test("400: responds with error message if incorrect data type provided as the review_id", async () => {
    const stringResult = await request(app)
      .get("/api/reviews/cats")
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const specialCharResult = await request(app)
      .get("/api/reviews/!@+$")
      .expect(400);
    expect(specialCharResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const numAndStringResult = await request(app)
      .get("/api/reviews/M30w")
      .expect(400);
    expect(numAndStringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  test("200: tweaks the votes property by either incrementing or decrementing the value, then responds with the updated review", async () => {
    const positiveNumResult = await request(app)
      .patch("/api/reviews/3")
      .send({ inc_votes: 3 })
      .expect(200);
    expect(positiveNumResult.body.review).toEqual({
      review_id: 3,
      title: "Ultimate Werewolf",
      review_body: "We couldn't find the werewolf!",
      designer: "Akihisa Okui",
      review_img_url:
        "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
      votes: 8,
      category: "social deduction",
      owner: "bainesface",
      created_at: "2021-01-18T10:01:41.251Z",
    });
    const negativeNumResult = await request(app)
      .patch("/api/reviews/3")
      .send({ inc_votes: -10 })
      .expect(200);
    expect(negativeNumResult.body.review).toEqual({
      review_id: 3,
      title: "Ultimate Werewolf",
      review_body: "We couldn't find the werewolf!",
      designer: "Akihisa Okui",
      review_img_url:
        "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
      votes: -2,
      category: "social deduction",
      owner: "bainesface",
      created_at: "2021-01-18T10:01:41.251Z",
    });
  });
  test("404: responds with error message if reviews spelled incorrectly", async () => {
    const result = await request(app)
      .patch("/api/revieews/3")
      .send({ inc_votes: 3 })
      .expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if review_id number not found", async () => {
    const result = await request(app)
      .patch("/api/reviews/99999")
      .send({ inc_votes: 3 })
      .expect(404);
    expect(result.body.msg).toBe(
      "Not Found - review_id provided is non-existent"
    );
  });
  test("400: responds with error message if incorrect data type provided as the review_id ", async () => {
    const stringResult = await request(app)
      .patch("/api/reviews/cats")
      .send({ inc_votes: 3 })
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const specialCharResult = await request(app)
      .patch("/api/reviews/!@+$")
      .send({ inc_votes: 3 })
      .expect(400);
    expect(specialCharResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const numAndStringResult = await request(app)
      .patch("/api/reviews/M30w")
      .send({ inc_votes: 3 })
      .expect(400);
    expect(numAndStringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
  });
  test("400: responds with error message if patch content does not include inc_votes", async () => {
    const result = await request(app)
      .patch("/api/reviews/3")
      .send({ category: "cats" })
      .expect(400);
    expect(result.body.msg).toBe(
      "Bad Request - inc_votes has not been provided"
    );
  });
  test("200: ignores other keys provided alongside inc_votes", async () => {
    const result = await request(app)
      .patch("/api/reviews/3")
      .send({ inc_votes: 3, category: "strategy" })
      .expect(200);
    expect(result.body.review).toEqual({
      review_id: 3,
      title: "Ultimate Werewolf",
      review_body: "We couldn't find the werewolf!",
      designer: "Akihisa Okui",
      review_img_url:
        "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
      votes: 8,
      category: "social deduction",
      owner: "bainesface",
      created_at: "2021-01-18T10:01:41.251Z",
    });
  });
});

describe("GET /api/reviews", () => {
  test("200: responds with an array of reviews objects", async () => {
    const result = await request(app).get("/api/reviews").expect(200);
    expect(result.body.reviews.length).toBe(13);
    result.body.reviews.forEach((review) => {
      expect(review).toMatchObject({
        review_id: expect.any(Number),
        title: expect.any(String),
        review_img_url: expect.any(String),
        votes: expect.any(Number),
        category: expect.any(String),
        owner: expect.any(String),
        created_at: expect.any(String),
        comment_count: expect.any(String),
      });
    });
    expect(result.body.reviews.length).toBe(13);
  });
  test("404: responds with error message if reviews spelled incorrectly", async () => {
    const result = await request(app).get("/api/revieews").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if api spelled incorrectly", async () => {
    const result = await request(app).get("/aip/reviews").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("200: accepts sort_by query and sorts reviews by column defined", async () => {
    const ownerResult = await request(app)
      .get("/api/reviews?sort_by=owner")
      .expect(200);
    expect(ownerResult.body.reviews).toBeSortedBy("owner", {
      descending: true,
    });
    const titleResult = await request(app)
      .get("/api/reviews?sort_by=title")
      .expect(200);
    expect(titleResult.body.reviews).toBeSortedBy("title", {
      descending: true,
    });
    const reviewIdResult = await request(app)
      .get("/api/reviews?sort_by=review_id")
      .expect(200);
    expect(reviewIdResult.body.reviews).toBeSortedBy("review_id", {
      descending: true,
    });
    const categoryResult = await request(app)
      .get("/api/reviews?sort_by=category")
      .expect(200);
    expect(categoryResult.body.reviews).toBeSortedBy("category", {
      descending: true,
    });
  });
  test("400: responds with error message when provided sort_by column is not legitimate", async () => {
    const stringResult = await request(app)
      .get("/api/reviews?sort_by=cats")
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Bad Request - sort_by statement is provided incorrectly"
    );
    const numResult = await request(app)
      .get("/api/reviews?sort_by=74738383")
      .expect(400);
    expect(numResult.body.msg).toBe(
      "Bad Request - sort_by statement is provided incorrectly"
    );
  });
  test("200: responds with reviews ordered by ASC or DESC if declared", async () => {
    const ascResult = await request(app)
      .get("/api/reviews?order=asc")
      .expect(200);
    expect(ascResult.body.reviews).toBeSortedBy("created_at", {
      descending: false,
    });
    const descResult = await request(app)
      .get("/api/reviews?order=desc")
      .expect(200);
    expect(descResult.body.reviews).toBeSortedBy("created_at", {
      descending: true,
    });
    expect(ascResult.body.reviews.length).toBe(13);
    expect(descResult.body.reviews.length).toBe(13);
  });
  test("400: responds with error message when provided order statement is not legitimate", async () => {
    const stringResult = await request(app)
      .get("/api/reviews?order=cats")
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Bad Request - order statement is provided incorrectly"
    );
    const numResult = await request(app)
      .get("/api/reviews?order=74738383")
      .expect(400);
    expect(numResult.body.msg).toBe(
      "Bad Request - order statement is provided incorrectly"
    );
  });
  test("200: responds to sort_by and order statement in the same path", async () => {
    const result = await request(app)
      .get("/api/reviews?sort_by=comment_count&order=asc")
      .expect(200);
    expect(result.body.reviews).toBeSortedBy("comment_count", {
      descending: false,
    });
    expect(result.body.reviews.length).toBe(13);
  });
  test("200: responds with array sorted by created_by and orders as DESC as default", async () => {
    const result = await request(app).get("/api/reviews").expect(200);
    expect(result.body.reviews).toBeSortedBy("created_at", {
      descending: true,
    });
    expect(result.body.reviews.length).toBe(13);
  });
  test("200: responds with a filtered array when category query is specified", async () => {
    const socialResult = await request(app)
      .get("/api/reviews?category=social_deduction")
      .expect(200);
    expect(socialResult.body.reviews.length).toBe(11);
    socialResult.body.reviews.forEach((review) => {
      expect(review).toMatchObject({
        review_id: expect.any(Number),
        title: expect.any(String),
        review_img_url: expect.any(String),
        votes: expect.any(Number),
        category: "social deduction",
        owner: expect.any(String),
        created_at: expect.any(String),
        comment_count: expect.any(String),
      });
    });
    expect(socialResult.body.reviews.length).toBe(11);
    const euroResult = await request(app)
      .get("/api/reviews?category=euro_game")
      .expect(200);
    euroResult.body.reviews.forEach((review) => {
      expect(review).toMatchObject({
        review_id: expect.any(Number),
        title: expect.any(String),
        review_img_url: expect.any(String),
        votes: expect.any(Number),
        category: "euro game",
        owner: expect.any(String),
        created_at: expect.any(String),
        comment_count: expect.any(String),
      });
    });
    expect(euroResult.body.reviews.length).toBe(1);
  });
  test("404: responds with error message when provided category is not found in category query", async () => {
    const stringResult = await request(app)
      .get("/api/reviews?category=cats!")
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Not Found - category provided is non-existent"
    );
  });
  test("200: category query, sort_by query and order query work together to provide result", async () => {
    const result = await request(app)
      .get(
        "/api/reviews?sort_by=comment_count&order=asc&category=social_deduction"
      )
      .expect(200);
    expect(result.body.reviews).toBeSortedBy("comment_count", {
      descending: false,
    });
    expect(result.body.reviews.length).toBe(11);
    result.body.reviews.forEach((review) => {
      expect(review).toMatchObject({
        review_id: expect.any(Number),
        title: expect.any(String),
        review_img_url: expect.any(String),
        votes: expect.any(Number),
        category: "social deduction",
        owner: expect.any(String),
        created_at: expect.any(String),
        comment_count: expect.any(String),
      });
    });
  });
  test("200: responds with an empty array of reviews when category is valid but there are no related reviews", async () => {
    const result = await request(app)
      .get("/api/reviews?category=children's_games")
      .expect(200);
    expect(result.body.reviews).toEqual([]);
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("200: responds with an array of comments for the provided review_id", async () => {
    const result = await request(app)
      .get("/api/reviews/2/comments")
      .expect(200);
    expect(result.body.comments).toEqual([
      {
        comment_id: 1,
        votes: 16,
        created_at: "2017-11-22T12:43:33.389Z",
        author: "bainesface",
        body: "I loved this game too!",
      },
      {
        comment_id: 4,
        votes: 16,
        created_at: "2017-11-22T12:36:03.389Z",
        author: "bainesface",
        body: "EPIC board game!",
      },
      {
        comment_id: 5,
        votes: 13,
        created_at: "2021-01-18T10:24:05.410Z",
        author: "mallionaire",
        body: "Now this is a story all about how, board games turned my life upside down",
      },
    ]);
  });
  test("404: responds with error message if reviews spelled incorrectly", async () => {
    const result = await request(app)
      .get("/api/revieews/2/comments")
      .expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if api spelled incorrectly", async () => {
    const result = await request(app)
      .get("/aip/reviews/3/comments")
      .expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if review_id number not found", async () => {
    const result = await request(app)
      .get("/api/reviews/99999/comments")
      .expect(404);
    expect(result.body.msg).toBe(
      "Not Found - review_id provided is non-existent"
    );
  });
  test("400: responds with error message if incorrect data type provided as the review_id ", async () => {
    const stringResult = await request(app)
      .get("/api/reviews/cats/comments")
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const specialCharResult = await request(app)
      .get("/api/reviews/!@+$/comments")
      .expect(400);
    expect(specialCharResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const numAndStringResult = await request(app)
      .get("/api/reviews/M30w/comments")
      .expect(400);
    expect(numAndStringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
  });
  test("200: responds with an empty array of comments when review_id is valid but there are no related comments ", async () => {
    const result = await request(app)
      .get("/api/reviews/10/comments")
      .expect(200);
    expect(result.body.comments).toEqual([]);
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  test("201: responds with the posted comment", async () => {
    const result = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(201);
    expect(result.body.comment).toMatchObject({
      comment_id: expect.any(Number),
      votes: 0,
      created_at: expect.any(String),
      author: "dav3rid",
      body: "my cat loves this game!",
    });
  });
  test("404: responds with error message if reviews spelled incorrectly", async () => {
    const result = await request(app)
      .post("/api/revieews/9/comments")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if comments spelled incorrectly", async () => {
    const result = await request(app)
      .post("/api/revieews/9/commeents")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if api spelled incorrectly", async () => {
    const result = await request(app)
      .post("/aip/reviews/9/comments")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if review_id number not found", async () => {
    const result = await request(app)
      .post("/api/reviews/900000/comments")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(404);
    expect(result.body.msg).toBe(
      "Not Found - review_id provided is non-existent"
    );
  });
  test("400: responds with error message if incorrect data type provided as the review_id", async () => {
    const stringResult = await request(app)
      .post("/api/reviews/cats/comments")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const specialCharResult = await request(app)
      .post("/api/reviews/!!!/comments")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(400);
    expect(specialCharResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const numAndStringResult = await request(app)
      .post("/api/reviews/me3330w/comments")
      .send({ username: "dav3rid", body: "my cat loves this game!" })
      .expect(400);
    expect(numAndStringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
  });
  test("404: responds with error message if user provided does not exist", async () => {
    const result = await request(app)
      .post("/api/reviews/2/comments")
      .send({
        username: "catLady400",
        body: "My 24 cats love to chew on the blocks",
      })
      .expect(404);
    expect(result.body.msg).toBe(
      "Not Found - username provided in post request is non-existent"
    );
  });
  test("400: responds with error message if post content does not include username or body", async () => {
    const result = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "cats", category: "pets" })
      .expect(400);
    expect(result.body.msg).toBe(
      "Bad Request - required field (username or body) has not been provided"
    );
  });
  test("201: ignores other keys provided alongside inc_votes", async () => {
    const result = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "dav3rid", category: "pets", body: "wow!" })
      .expect(201);
    expect(result.body.comment).toMatchObject({
      comment_id: expect.any(Number),
      votes: 0,
      created_at: expect.any(String),
      author: "dav3rid",
      body: "wow!",
    });
  });
});

describe("DELETE /api/comments/comment_id", () => {
  test('204: successfully removes the specific comment and provides message "No Content"', async () => {
    const result = await request(app).delete("/api/comments/4").expect(204);
    expect(result.status).toBe(204);
    const dbCheck = await db.query(
      "SELECT * FROM comments WHERE comment_id = 4;"
    );
    expect(dbCheck.rows.length).toEqual(0);
  });
  test("404: responds with error message if comments spelled incorrectly", async () => {
    const result = await request(app).delete("/api/commeents/4").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if api spelled incorrectly", async () => {
    const result = await request(app).delete("/aip/comments/4").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("400: responds with error message if incorrect data type provided as the comment_id", async () => {
    const stringResult = await request(app)
      .delete("/api/comments/cats")
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const specialCharResult = await request(app)
      .delete("/api/comments/!&$£")
      .expect(400);
    expect(specialCharResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const numAndStringResult = await request(app)
      .delete("/api/comments/m30w")
      .expect(400);
    expect(numAndStringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
  });
  test("404: responds with error message if comment_id number not found", async () => {
    const result = await request(app).delete("/api/comments/9999").expect(404);
    expect(result.body.msg).toBe(
      "Not Found - comment_id provided is non-existent"
    );
  });
});

describe("GET /api/users", () => {
  test("200: responds with an array of objects which should each have a username property", async () => {
    const result = await request(app).get("/api/users").expect(200);
    expect(result.body.users.length).toBe(4);
    result.body.users.forEach((user) => {
      expect(user).toMatchObject({
        username: expect.any(String),
      });
    });
  });
  test("404: responds with error message if users spelled incorrectly", async () => {
    const result = await request(app).get("/api/uzers").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if api spelled incorrectly", async () => {
    const result = await request(app).get("/aip/users").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
});

describe("GET /api/users/:username", () => {
  test("200: responds with the user object for the relevant username provided", async () => {
    const result = await request(app).get("/api/users/dav3rid").expect(200);
    expect(result.body.user).toEqual({
      username: "dav3rid",
      name: "dave",
      avatar_url:
        "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
    });
  });
  test("404: responds with error message if users spelled incorrectly", async () => {
    const result = await request(app).get("/api/userz/dav3rid").expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if username not found", async () => {
    const result = await request(app)
      .get("/api/users/HarryHedgehog")
      .expect(404);
    expect(result.body.msg).toBe(
      "Not Found - username provided is non-existent"
    );
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: tweaks the votes property by either incrementing or decrementing the value, then responds with the updated comment", async () => {
    const positiveNumResult = await request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: 3 })
      .expect(200);
    expect(positiveNumResult.body.comment).toEqual({
      comment_id: 3,
      author: "philippaclaire9",
      review_id: 3,
      votes: 13,
      created_at: "2021-01-18T10:09:48.110Z",
      body: "I didn't know dogs could play games",
    });
    const negativeNumResult = await request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: -3 })
      .expect(200);
    expect(negativeNumResult.body.comment).toEqual({
      comment_id: 3,
      author: "philippaclaire9",
      review_id: 3,
      votes: 10,
      created_at: "2021-01-18T10:09:48.110Z",
      body: "I didn't know dogs could play games",
    });
  });
  test("404: responds with error message if comments spelled incorrectly", async () => {
    const result = await request(app)
      .patch("/api/commentss/3")
      .send({ inc_votes: 3 })
      .expect(404);
    expect(result.body.msg).toBe("Invalid URL - incorrect path provided");
  });
  test("404: responds with error message if comment_id number not found", async () => {
    const result = await request(app)
      .patch("/api/comments/99999")
      .send({ inc_votes: 3 })
      .expect(404);
    expect(result.body.msg).toBe(
      "Not Found - comment_id provided is non-existent"
    );
  });
  test("400: responds with error message if incorrect data type provided as the comment_id ", async () => {
    const stringResult = await request(app)
      .patch("/api/comments/cats")
      .send({ inc_votes: 3 })
      .expect(400);
    expect(stringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const specialCharResult = await request(app)
      .patch("/api/comments/!@+$")
      .send({ inc_votes: 3 })
      .expect(400);
    expect(specialCharResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
    const numAndStringResult = await request(app)
      .patch("/api/comments/M30w")
      .send({ inc_votes: 3 })
      .expect(400);
    expect(numAndStringResult.body.msg).toBe(
      "Invalid Data Type - provided input is not an authorised data type"
    );
  });
  test("400: responds with error message if patch content does not include inc_votes", async () => {
    const result = await request(app)
      .patch("/api/comments/3")
      .send({ category: "cats" })
      .expect(400);
    expect(result.body.msg).toBe(
      "Bad Request - inc_votes has not been provided"
    );
  });
  test("200: ignores other keys provided alongside inc_votes", async () => {
    const result = await request(app)
      .patch("/api/comments/3")
      .send({ inc_votes: 3, category: "strategy" })
      .expect(200);
    expect(result.body.comment).toEqual({
      comment_id: 3,
      author: "philippaclaire9",
      review_id: 3,
      votes: 13,
      created_at: "2021-01-18T10:09:48.110Z",
      body: "I didn't know dogs could play games",
    });
  });
});

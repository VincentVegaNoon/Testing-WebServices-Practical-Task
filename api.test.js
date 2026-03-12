import test from "node:test";
import assert from "node:assert";
import { authData, newBookingData, updatedBookingData } from "./data.js";
import { request } from "./apiClient.js";

let token = "";
let bookingId = "";

test("Restful Booker API", async (t) => {
  await t.test("Create a token", async () => {
    const { response, data } = await request("/auth", {
      method: "POST",
      body: JSON.stringify(authData),
    });

    assert.strictEqual(response.status, 200, "Status code should be 200");
    assert.ok(response.headers.get("content-type").includes("application/json"), "Header Content-Type should be JSON");
    assert.ok(data.token, "Token should be present");

    token = data.token;
  });

  await t.test("Create a booking", async () => {
    const { response, data } = await request("/booking", {
      method: "POST",
      body: JSON.stringify(newBookingData),
    });

    assert.strictEqual(response.status, 200, "Status code should be 200");
    assert.ok(response.headers.get("content-type").includes("application/json"), "Header Content-Type should be JSON");
    assert.ok(data.bookingid, "Booking ID should be returned in body");
    assert.strictEqual(data.booking.firstname, newBookingData.firstname, "First name match");

    bookingId = data.bookingid;
  });

  await t.test("Get created booking by id", async () => {
    const { response, data } = await request(`/booking/${bookingId}`);

    assert.strictEqual(response.status, 200, "Status code should be 200");
    assert.ok(response.headers.get("content-type").includes("application/json"), "Header Content-Type should be JSON");
    assert.strictEqual(data.firstname, newBookingData.firstname, "Fetched first name match");
  });

  await t.test("Update booking", async () => {
    const { response, data } = await request(
      `/booking/${bookingId}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedBookingData),
      },
      token,
    );

    assert.strictEqual(response.status, 200, "Status code should be 200");
    assert.ok(response.headers.get("content-type").includes("application/json"), "Header Content-Type should be JSON");
    assert.strictEqual(data.totalprice, updatedBookingData.totalprice, "Total price should be updated in body");
  });

  await t.test("Remove booking", async () => {
    const { response } = await request(
      `/booking/${bookingId}`,
      {
        method: "DELETE",
      },
      token,
    );

    assert.strictEqual(response.status, 201, "Status code should be 201 for successful deletion");
    assert.ok(response.headers.get("content-type").includes("text/plain"), "Header Content-Type should be text/plain");
    const { response: verifyResponse } = await request(`/booking/${bookingId}`);
    assert.strictEqual(verifyResponse.status, 404, "Status code should be 404");
  });
});

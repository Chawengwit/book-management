const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

const verifyToken = require("../service/verify_token");

describe("verifyToken middleware (redirect version)", () => {
    const SECRET = "testsecret";
    process.env.JWT_SECRET = SECRET;

    it("should redirect to /login if no token is present in session", async () => {
        const app = express();

        app.use((req, res, next) => {
        req.session = {}; // Simulate missing token
        next();
        });

        app.get("/protected", verifyToken, (req, res) => {
        res.status(200).json({ success: true });
        });

        const res = await request(app).get("/protected");

        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal("/login");
    });

    it("should redirect to /login if token is invalid", async () => {
        const app = express();

        app.use((req, res, next) => {
        req.session = { token: "invalid.token.value" }; // Simulate tampered token
        next();
        });

        app.get("/protected", verifyToken, (req, res) => {
        res.status(200).json({ success: true });
        });

        const res = await request(app).get("/protected");

        expect(res.status).to.equal(302);
        expect(res.headers.location).to.equal("/login");
    });

    it("should allow access if token is valid", async () => {
        const app = express();
        const payload = { id: 1, email: "test@example.com" };
        const validToken = jwt.sign(payload, SECRET);

        app.use((req, res, next) => {
        req.session = { token: validToken };
        next();
        });

        app.get("/protected", verifyToken, (req, res) => {
        res.status(200).json({ success: true, user: req.user });
        });

        const res = await request(app).get("/protected");

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("success", true);
        expect(res.body.user).to.include(payload);
    });
});

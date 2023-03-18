const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const teams = require("./routes/api/items");
const fileRoutes = require("./routes/file-upload-routes");
const { PythonShell } = require("python-shell");

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

app.post("/predict", (req, res, next) => {
  //Here are the option object in which arguments can be passed for the python_test.js.
  var input = {
    win: req.body.win,
    lose: req.body.lose,
  };
  console.log(input.win, " VS ", input.lose);
  let options = {
    args: [input.win, input.lose],
  };

  PythonShell.run("app.py", options, function (err, result) {
    if (err) throw err;
    // result is an array consisting of messages collected
    //during execution of script.
    console.log("result: ", result.toString());
    res.send(result.toString());
  });
});

// Routes
app.use("/api/users", users);
app.use("/api/teams", teams);

app.get("/", (req, res) => {
  console.log("NetteN Hello World!!");
  res.send("NetteN Hello World!!");
});
// app.use('/api', fileRoutes.routes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));

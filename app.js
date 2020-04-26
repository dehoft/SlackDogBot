const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 4390;

async function findBreed(breed) {
  await axios
    .get("https://dog.ceo/api/breed/" + breed + "/list/random/10")
    .then((res) => {
      console.log(res.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function showSpecificBreed(breed, subbreed) {
  await axios
    .get(
      "https://dog.ceo/api/breed/" + breed + "/" + subbreed + "/images/random"
    )
    .then((res) => {
      console.log(res.data.message);
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function showRandomBreed() {
  await axios
    .get("https://dog.ceo/api/breeds/image/random")
    .then((res) => {
      console.log(res.data.message);
    })
    .catch(function (error) {
      console.log(error);
    });
}

app.listen(PORT, function () {
  console.log("Example app listening on port " + PORT);
});

app.get("/", function (req, res) {
  res.send("Ngrok is working! Path Hit: " + req.url);
});

app.get("/oauth", function (req, res) {
  if (!req.query.code) {
    res.status(500);
    res.send({ Error: "Looks like we're not getting code." });
    console.log("Looks like we're not getting code.");
  } else {
    request(
      {
        url: "https://slack.com/oauth/v2/authorize", //URL to hit
        qs: {
          code: req.query.code,
          client_id: clientId,
          client_secret: clientSecret,
        }, //Query string data
        method: "GET", //Specify the method
      },
      function (error, response, body) {
        if (error) {
          console.log(error);
        } else {
          res.json(body);
        }
      }
    );
  }
});

app.post("/bot", function (req, res) {
  let text = req.body.text;
  let commands = text.split(" ");
  let lenght = Object.keys(commands).length;
  
  if (commands[0] == "bot,") {
    switch (commands[1]) {
      case "show":
        if (lenght == 3) {
          if (commands[2] == "random") {
            axios
              .get("https://dog.ceo/api/breeds/image/random")
              .then((response) => {
                let data = {
                  response_type: "in_channel",
                  attachments: [
                    {
                      image_url: response.data.message,
                    },
                  ],
                };
                res.send(data);
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        } else if (lenght == 4) {
          axios
            .get(
              "https://dog.ceo/api/breed/" +
                commands[3] +
                "/" +
                commands[2] +
                "/images/random"
            )
            .then((response) => {
              let data = {
                response_type: "in_channel",
                attachments: [
                  {
                    image_url: response.data.message,
                  },
                ],
              };
              res.send(data);
            })
            .catch(function (error) {
              res.send(
                "Please check if the breed exists \n Syntax: \n /hey bot, show {subbreed} {breed}"
              );
            });
        }
        break;

      case "find":
        axios
          .get("https://dog.ceo/api/breed/" + commands[2] + "/list/random/10")
          .then((response) => {
            let data = {
              response_type: "in_channel",
              text: getString(response.data.message, commands[2]),
            };

            res.send(data);
          })
          .catch(function (error) {
            console.log(error);
          });
        break;
    }
  }
});

function getString(arr, breed) {
  let result = "";
  for (i in arr) {
    result = result + arr[i] + " " + breed + "\n";
  }
  return result;
}

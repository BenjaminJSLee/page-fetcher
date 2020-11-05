const fs = require('fs');
const request = require('request');
const readline = require('readline');

const args = process.argv.slice(2);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

if (args.length < 2) {
  console.log('Error: not enough arguments.');
  process.exit();
}

request(args[0], (err, response, body) => {
  if (err) {
    console.log(err.message);
    process.exit();
  }
  if (response && (Number(response.statusCode) >= 300 || Number(response.statusCode) < 200)) {
    console.log('error',response.statusCode);
    process.exit();
  }
  fs.access(args[1],fs.F_OK, (err) => {
    if (!err) {
      rl.question(`File ${args[1]} already exists. Overwrite? (y/n): `, (answer) => {
        if (!/[yY]/g.test(answer)) {
          console.log('Cancelling write...');
          process.exit();
        }
        fs.writeFile(args[1], body, (err) => {
          if (err) {
            console.log(err.message);
            process.exit();
          }
          const bytes = fs.statSync(args[1]).size;
          console.log(`Downloaded and saved ${bytes} bytes to ${args[1]}`);
        });
        rl.close();
      });
    } else {
      fs.writeFile(args[1], body, (err) => {
        if (err) {
          console.log(err.message);
          process.exit();
        }
        const bytes = fs.statSync(args[1]).size;
        console.log(`Downloaded and saved ${bytes} bytes to ${args[1]}`);
      });
    }
  });
});
const child_process = require('child_process');

const run = (cwd, command, args) => {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(command, args, {
      cwd,
    });

    let output = '';

    process.stdout.on('data', data => {
      output += data.toString();
    });

    process.stderr.on('data', data => {
      output += data.toString();
    });

    process.on('close', code => {
      if (code === 0) {
        resolve({
          code,
          output,
        });
      } else {
        reject({
          code,
          output,
        });
      }
    });
  });
};

const rejectWithOutput = p =>
  p.catch(e => {
    throw e.output;
  });

const resolveWithOutput = p => p.then(r => r.output);

module.exports.run = run;
module.exports.rejectWithOutput = rejectWithOutput;
module.exports.resolveWithOutput = resolveWithOutput;

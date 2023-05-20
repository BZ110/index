const promptsync = require('prompt-sync')();
const colors = require('colors');
const fs = require('fs');
const hash = require('hash.js');
const https = require('https');

    // I only programmed mod checking because to be honest after my demotion
    // i've been really not focusing on this. This was going to be a multipurpose
    // screensharing tool for almost all clients. 
    //
    // Sad. :(
    //

    // I spent like 4 hours on this, but what made me spend the most time was testing and learning the API.
    // Just learning the Modrinth API added like 3 extra hours. (4 + 3)


const logs = [];
const logsbs64 = [];
const mods = [];
const finishedModCheck = {
  ableToSearch: [],
  unableToSearch: [],
  valid: [],
  potentialRat: []
};

async function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function lookForMC(x) {
  async function ifValid(path) {
    try {
      await fs.promises.access(path);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return true;
    } catch (error) {
      return false;
    }
  }

  switch (x) {
    // I only programmed mod checking because to be honest after my demotion
    // i've been really not focusing on this. This was going to be a multipurpose
    // screensharing tool for almost all clients. 
    //
    // Sad. :(
    //
    case 'mods':
      return await ifValid(process.env.APPDATA + '/.minecraft/mods');

      // Only case 'mods' is used, you can delete the rest.
    case 'feather-mods':
      return await ifValid(process.env.APPDATA + '/.minecraft/feather-mods');
    case 'fabric':
      return await ifValid(process.env.APPDATA + '/.minecraft/.fabric');
    case 'fabric/processedMods':
      return await ifValid(process.env.APPDATA + '/.minecraft/.fabric/processedMods');
    case 'fabric/remappedJars':
      return await ifValid(process.env.APPDATA + '/.minecraft/.fabric/remappedJars');
    case 'optifine':
      if (await ifValid(process.env.APPDATA + '/.minecraft/.optifine')) {
        const files = await fs.promises.readdir(process.env.APPDATA + '/.minecraft/.optifine');
        return [true, files];
      }
      return [false, undefined];
    default:
      return await ifValid(process.env.APPDATA + '/.minecraft');
  }
}

async function main() {
  console.log('----------------------------------');
  console.log('Index Screenshare Tool');
  console.log('Please disable all antivirus software before continuing, as it will stop the program from running.');
  console.log('----------------------------------');
  console.log('\nDo you wish to continue? (y/n)');
  const Continue = promptsync('>> ');

  if (Continue === 'y') {
    console.clear();

    if (await lookForMC()) {
      console.log('Minecraft Installation found, continuing...');
      logs.push('Minecraft found');
    }

    if (await lookForMC('mods')) {
      let files;
      try {
        files = await fs.promises.readdir(process.env.APPDATA + '/.minecraft/mods');
        logs.push('----- START OF MODS -----');
        logsbs64.push('----- START OF MODS -----');
        logs.push('Found ' + files.length + ' items (/.minecraft/mods directory)');

        for (let i = 0; i < files.length; i++) {
          const sha1Hash = hash.sha1().update(fs.readFileSync(process.env.APPDATA + '/.minecraft/mods/' + files[i])).digest('hex');
          const file = files[i];
          mods.push([file, sha1Hash]);
          logs.push(sha1Hash + ' ' + file);
          logsbs64.push('File Name: ' + file);
          logsbs64.push('  ' + Buffer.from(fs.readFileSync(process.env.APPDATA + '/.minecraft/mods/' + file)).toString('base64'));
          console.clear();
          console.log(('[' + i + '/' + (files.length - 1) + ']').green);
        }

        logsbs64.push('----- END OF MODS -----');
        logs.push('----- END OF MODS -----');
      } catch (error) {
        console.error(error);
      }
    }

    logs.push('--- START OF MOD ANALYSIS ---');

    for (let i = 0; i < mods.length; i++) {
      const mod = mods[i][0];
      if (mod.includes('.jar')) {
        try {
          const data = await fetch('https://api.modrinth.com/v2/search?limit=5&query=' + mod.replace('.jar', ''));
          const response = JSON.parse(data);

          if (response.hits.length > 0) {
            console.log(mod + ' ' + 'https://api.modrinth.com/v2/search?limit=5&query=' + mod.replace('.jar', ''))
            finishedModCheck.ableToSearch.push(mod + ' ' + 'https://api.modrinth.com/v2/search?limit=5&query=' + mod.replace('.jar', ''))

            try {
              const ResponseData = await fetch('https://api.modrinth.com/v2/version_file/' + mods[i][1]);
              // Just see if this fetch returns anything, if it does then we know it (atleast) matches.
              finishedModCheck.valid.push(mods[i][0] + " (" + ResponseData["filename"] + ")");
            } catch (error) {
              finishedModCheck.potentialRat.push(mods[i][0]);
            }
          } else {
            finishedModCheck.unableToSearch.push(mods[i][0]);
          }
        } catch (error) {
          finishedModCheck.unableToSearch.push(mods[i][0]);
        }
      }
    }
    logs.push('\n--- END OF MOD ANALYSIS ---\n\n');
    logs.push("--- START OF RESULT OF MOD ANALYSIS ---")
    logs.push("\n")
    for(let i = 0; i < finishedModCheck.valid.length; i++) {
      logs.push("Valid: " + finishedModCheck.valid[i])
    }
    logs.push("\n")
    for(let i = 0; i < finishedModCheck.potentialRat.length; i++) {
      logs.push("Unable to search (search manually to see if it's a masked hack client) [modrinth had results (may be innacurate), but the file was not found on their server.]: " + finishedModCheck.potentialRat[i])
    }
    for(let i = 0; i < finishedModCheck.unableToSearch.length; i++) {
      logs.push("Unable to search (search manually to see if it's a masked hack client) [modrinth turned no results so it may be a customized mod]: " + finishedModCheck.unableToSearch[i])
    }
    logs.push("\n")
    logs.push("--- END OF RESULT OF MOD ANALYSIS ---")
    logs.push("To do a manual comparison, you can use this website: https://emn178.github.io/online-tools/sha1_checksum.html")
    logs.push("This uses the search function in Modrinth to see if a mod might be masked.\nThis may give many false positives for seemingly no reason, so you should double check the mod if it does flag.")
    logs.push("99% of the time it will flag as a potential RAT, but it is not. If it does, just for precaution, you should double check the mod.")
    console.log('Press enter to continue...');
    promptsync('');

    console.log('Saving files...');
    fs.writeFileSync('res(LIGHT)-diagnostic.diagnostic', logs.join('\n'));
    fs.writeFileSync('res(HEAVY)-diagnostic.diagnostic', logsbs64.join('\n'));

    console.log('Press any key to continue...');

    process.exit(0);
  }
}

main();

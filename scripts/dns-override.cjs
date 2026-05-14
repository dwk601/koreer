// Routes the koreaJobApiV2 hostname through the Tailscale IP for local
// testing without /etc/hosts. Loaded into Next.js via
// NODE_OPTIONS=--require=./scripts/dns-override.cjs
/* eslint-disable @typescript-eslint/no-require-imports */
const dns = require("node:dns");

const TARGETS = {
  "api-srku356jbc5fqtrtwff3j3pd.50.146.245.162.sslip.io": "100.92.189.13",
};

const origLookup = dns.lookup;
const origLookupP = dns.promises.lookup;

function shouldOverride(hostname) {
  return Object.prototype.hasOwnProperty.call(TARGETS, hostname);
}

dns.lookup = function patchedLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = undefined;
  }
  if (shouldOverride(hostname)) {
    const address = TARGETS[hostname];
    const family = 4;
    if (options && options.all) {
      return process.nextTick(callback, null, [{ address, family }]);
    }
    return process.nextTick(callback, null, address, family);
  }
  return origLookup.call(this, hostname, options, callback);
};

dns.promises.lookup = async function patchedLookupP(hostname, options) {
  if (shouldOverride(hostname)) {
    const address = TARGETS[hostname];
    const family = 4;
    if (options && options.all) return [{ address, family }];
    return { address, family };
  }
  return origLookupP.call(this, hostname, options);
};

console.log(
  "[dns-override] resolving",
  Object.keys(TARGETS).join(", "),
  "→ Tailscale IPs",
);

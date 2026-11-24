#!/usr/bin/env bash
# Turn a passing Daylight run into a static Pages directory. Count game folders,
# not every index.html: the engineering report is deliberately a separate page.
set -euo pipefail
shopt -s nullglob
usage(){ echo "Usage: bash scripts/package-site.sh EVIDENCE_JSON SCREENSHOTS_DIR SHA OUTPUT_DIR" >&2; exit 2; }
[[ $# == 4 && $3 =~ ^[0-9a-f]{40}$ ]] || usage
evidence=$(realpath "$1")
shots=$(realpath "$2")
revision=$3
output=$(realpath -m "$4")
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"
[[ ! -e "$output/index.html" ]] || { echo "Refusing to overwrite existing Pages artifact at $output" >&2; exit 1; }
node -e '
const fs=require("node:fs"),check=require("node:assert/strict");
const e=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
check.equal(e.schema,1);
check.equal(e.revision,process.argv[2]);
check.deepEqual(e.title_routes,{passed:100,planned:100});
check.equal(e.failed_routes.length,0);
check(e.flows.native_fullscreen_verified&&e.flows.checkers_rejected_native_used_fallback&&e.flows.two_owned_contexts_silenced_and_closed);
' "$evidence" "$revision"
mkdir -p "$output"
cp -a .nojekyll index.html assets docs report "$output/"
for id in {1..100}; do
  printf -v prefix '%02d' "$id"
  entry=("$prefix"-*/)
  [[ ${#entry[@]} == 1 && -s "${entry[0]}/index.html" ]] || {
    echo "Expected one playable folder for game $prefix" >&2; exit 1;
  }
  cp -a "${entry[0]}" "$output/"
done
cp "$evidence" "$output/report/evidence.json"
for shot in daylight-mobile-library.png daylight-mobile-whack.png daylight-mobile-checkers-immersive.png; do
  [[ -s "$shots/$shot" ]]
  cp "$shots/$shot" "$output/report/"
done
printf '%s\n' "$revision" > "$output/arcade-release.txt"
echo "Packaged all 100 numbered games, report evidence and screenshots for $revision"

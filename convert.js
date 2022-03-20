const fs = require('fs');
let coloursJSON = require('./coloursJSON.json');
let version = "1.18.1";
let presetStr = "0Q1W2Q3R4S5Q6Q7Q8R9QbRcSdTeTfTgThTiTjTkTlTmTnToTpTqTrTsTtQuQvQwQxRyQzQ10Q11Q12Q13Q14Q15Q16Q17Q18Q19Q1aQ1bQ1cQ1dQ1eQ1fQ1gS1hQ1iQ1jS1kQ1lQ1mQ1nQ";

function decodePreset(presetStr) {
    if (!/^[0-9a-zQ-ZA-P]*$/g.test(presetStr)) {
        return null;
    }
    let presetRegex = /([0-9a-z]+)(?=([Q-ZA-P]+))/g;
    let match;
    blocklist = [];
    while ((match = presetRegex.exec(presetStr)) !== null) {
        const encodedColourSetId = match[1];
        const encodedBlockId = match[2];
        const decodedColourSetId = parseInt(encodedColourSetId, 36).toString();
        const decodedPresetIndex = parseInt(
            encodedBlockId
                .replace(/[Q-Z]/g, (match) => {
                    return {
                        Q: "0",
                        R: "1",
                        S: "2",
                        T: "3",
                        U: "4",
                        V: "5",
                        W: "6",
                        X: "7",
                        Y: "8",
                        Z: "9",
                    }[match];
                })
                .toLowerCase(),
            26
        );
        if (!(decodedColourSetId in coloursJSON)) {
            continue;
        }
        const decodedBlock = Object.entries(coloursJSON[decodedColourSetId].blocks).find((elt) => elt[1].presetIndex === decodedPresetIndex);
        if (decodedBlock === undefined) {
            continue;
        }
        const decodedBlockId = decodedBlock[0].toString();
        if (Object.keys(coloursJSON[decodedColourSetId].blocks[decodedBlockId].validVersions).includes(version)) {
            blocklist.push({
                "block": getBlockNameWithArgs(coloursJSON[decodedColourSetId].blocks[decodedBlockId]),
                "colors": [coloursJSON[decodedColourSetId].tonesRGB.dark, coloursJSON[decodedColourSetId].tonesRGB.normal, coloursJSON[decodedColourSetId].tonesRGB.light, coloursJSON[decodedColourSetId].tonesRGB.unobtainable]
            });
        }
    }
    return blocklist;
};

function getBlockNameWithArgs(block) {
    let blockNBTData = block.validVersions[version];
    if (typeof blockNBTData === "string") {
        blockNBTData = block.validVersions[blockNBTData.slice(1)];
    }
    let name = blockNBTData.NBTName;
    if (Object.entries(blockNBTData.NBTArgs).length !== 0) {
        name += '[';
        name += Object.entries(blockNBTData.NBTArgs)
            .map(([key, value]) => `${key}=${value}`)
            .join(',')
        name += ']';
    }
    return name;
}

let preset = decodePreset(presetStr);
fs.writeFileSync('mapColors.json', JSON.stringify(preset, null, 2));
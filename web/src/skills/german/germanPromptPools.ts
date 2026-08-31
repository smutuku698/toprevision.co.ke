// Shared prompt-wording pools for the Grade 9 German skills, so a branch's visible instruction
// line is drawn from several distinct phrasings instead of being one hardcoded string that reads
// identically every time that branch is picked in a practice session. Each helper returns 5-8
// reworded variants; callers pass in whatever topic/subject words make the branch's original
// instruction accurate. See RIGOR/repetition-defense rules in root CLAUDE.md.

/** For a True/False categorize branch checking statements against a reading passage or dialogue. */
export function trueFalsePrompts(source: "text" | "dialogue" = "text"): string[] {
  return [
    `Sort each statement as True or False, based on the ${source}.`,
    `Decide whether each statement is True or False, using the ${source}.`,
    `Read the ${source} again and mark each statement True or False.`,
    `Which of these statements are True and which are False, according to the ${source}?`,
    `Check each statement against the ${source} and sort it as True or False.`,
    `Using the ${source} above, sort each statement into True or False.`,
  ];
}

/** For a click-match branch pairing a German word/expression with its English meaning. */
export function matchMeaningPrompts(topic: string): string[] {
  return [
    `Match each German ${topic} to its English meaning.`,
    `Pair each German ${topic} with the English meaning that fits.`,
    `Connect each German ${topic} to its correct English translation.`,
    `Work out what each German ${topic} means in English, then match it up.`,
    `Link each German ${topic} with its English meaning.`,
    `Match the German ${topic} on the left to its English meaning on the right.`,
  ];
}

/** For a two-way (or more) categorize branch. `descriptor` is the bucket text without "as", e.g. `a Place (Ort) or a Direction (Richtung)`. */
export function categorizePrompts(subject: string, descriptor: string): string[] {
  return [
    `Sort each ${subject} as ${descriptor}.`,
    `Decide whether each ${subject} is ${descriptor}, then sort it into the right group.`,
    `Group each ${subject} as ${descriptor}.`,
    `Read each ${subject} and sort it as ${descriptor}.`,
    `Place each ${subject} in the group that fits: ${descriptor}.`,
    `Work out whether each ${subject} is ${descriptor}, then sort it there.`,
  ];
}

/** For an ordering branch that assembles a correct German sentence from shuffled chunks. */
export function orderingPrompts(topic?: string): string[] {
  const suffix = topic ? ` about ${topic}` : "";
  return [
    `Arrange the words/phrases to form a correct German sentence${suffix}.`,
    `Put the words/phrases in the right order to make a correct German sentence${suffix}.`,
    `Rearrange these words/phrases into a correct German sentence${suffix}.`,
    `Click the words/phrases in the order that forms a correct German sentence${suffix}.`,
    `Reorder the pieces to build a correct German sentence${suffix}.`,
    `Assemble the words/phrases into a correct German sentence${suffix}.`,
  ];
}

/** For a fill-blank branch completing a German sentence. `itemWord` e.g. "word"/"family word"; `sentenceDesc` e.g. "sentence"/"restaurant sentence". */
export function fillBlankPrompts(itemWord = "word", sentenceDesc = "sentence"): string[] {
  return [
    `Fill in the missing ${itemWord} to complete the German ${sentenceDesc}.`,
    `Complete the German ${sentenceDesc} by filling in the missing ${itemWord}.`,
    `What ${itemWord} is missing from this German ${sentenceDesc}?`,
    `Supply the missing ${itemWord} to finish the German ${sentenceDesc}.`,
    `Work out the missing ${itemWord} and complete the German ${sentenceDesc}.`,
    `Type the missing ${itemWord} to complete the German ${sentenceDesc}.`,
  ];
}

/** For a click-match branch pairing a descriptive clue with the thing it identifies (e.g. an animal). */
export function matchCluePrompts(target: string): string[] {
  return [
    `Match each clue to the ${target} it describes.`,
    `Work out which ${target} each clue describes, then match them up.`,
    `Pair each clue with the correct ${target}.`,
    `Read each clue and connect it to the ${target} it is describing.`,
    `Use each clue to identify and match the correct ${target}.`,
    `Connect every clue to the ${target} it points to.`,
  ];
}

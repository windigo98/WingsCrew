// Caught Red-Handed — local prompt deck. Nothing here is fetched at runtime.
// Higher points are spicier. Wild Dares are written dares the caught player may perform.
window.CRH_CATEGORIES = [
  {
    id: "confessions",
    name: "Confessions",
    blurb: "Say the quiet part.",
    prompts: [
      { points: 100, text: "What's a tiny crime you commit all the time and fully plan to keep doing?" },
      { points: 200, text: "Confess the last lie you told to get out of plans. What was the fake excuse?" },
      { points: 300, text: "What's a secret you kept from a partner or a close friend that still makes you wince?" },
      { points: 400, text: "Admit the thirstiest thing you've done that you promised you'd take to the grave." },
      { points: 500, text: "Confess the messiest secret still yours to tell. No full names, but make it specific enough to catch you." }
    ]
  },
  {
    id: "hot-takes",
    name: "Hot Takes",
    blurb: "Die on a silly hill.",
    prompts: [
      { points: 100, text: "What's a popular opinion you think is actually embarrassing?" },
      { points: 200, text: "Defend a food take that would get you uninvited from dinner." },
      { points: 300, text: "What dating rule does everyone follow that you think is nonsense?" },
      { points: 400, text: "Name a so-called red flag you find attractive anyway. Keep it adult and consensual." },
      { points: 500, text: "Give your hottest take about dating, hookups, or this friend group. One sentence. No cruelty." }
    ]
  },
  {
    id: "dating-disasters",
    name: "Dating Disasters",
    blurb: "The date went sideways.",
    prompts: [
      { points: 100, text: "Describe your worst first-date outfit like you're filing a report." },
      { points: 200, text: "What was the exact moment you knew a date was over, and why did you stay anyway?" },
      { points: 300, text: "Tell the story of a date you escaped. Fake emergency, early Uber, window — name the method." },
      { points: 400, text: "What's the most awkward thing you've said while trying to flirt?" },
      { points: 500, text: "Recount a date that went so far off the rails it became a group-chat legend." }
    ]
  },
  {
    id: "drunk-decisions",
    name: "Drunk Decisions",
    blurb: "Sober you would like a word.",
    prompts: [
      { points: 100, text: "What's the most harmless, slightly expensive decision you've made after \"just one more\"?" },
      { points: 200, text: "Describe a text you sent that sober-you would have paid to unsend." },
      { points: 300, text: "What plan did you make after midnight that you had to apologize for the next day?" },
      { points: 400, text: "Tell us about a night you lost the plot and woke up in a different one." },
      { points: 500, text: "What's a tipsy decision you still haven't fully explained to the people in this room?" }
    ]
  },
  {
    id: "guilty-pleasures",
    name: "Guilty Pleasures",
    blurb: "You replay it. You deny it.",
    prompts: [
      { points: 100, text: "What do you rewatch, replay, or reread that you roast other people for liking?" },
      { points: 200, text: "Name the snack, song, or reality show you'd hide if a crush came over." },
      { points: 300, text: "What romantic or spicy habit do you pretend you're too cool for?" },
      { points: 400, text: "Which celebrity or fictional adult character do you think about more than you will admit out loud?" },
      { points: 500, text: "What's a guilty pleasure you'd only confess with the lights low? Keep it funny, not a novel." }
    ]
  },
  {
    id: "workplace",
    name: "Workplace Scandal",
    blurb: "HR does not need to know.",
    prompts: [
      { points: 100, text: "What's the pettiest thing you've done at a job and still feel good about?" },
      { points: 200, text: "Confess a stretch on your résumé or in an interview that somehow worked." },
      { points: 300, text: "Tell us about an office crush, a flirty message, or a happy hour that got dangerous." },
      { points: 400, text: "What's the most unprofessional thing you've gotten away with at work?" },
      { points: 500, text: "Spill a work story that would make HR open a tab. Leave out real names." }
    ]
  },
  {
    id: "never-have-i",
    name: "Never Have I Ever",
    blurb: "Finish the confession.",
    prompts: [
      { points: 100, text: "Never have I ever pretended to know a song, a wine, or a person. Finish that confession." },
      { points: 200, text: "Never have I ever snooped in a partner's or roommate's phone. If you have, what do you wish you hadn't found?" },
      { points: 300, text: "Never have I ever hooked up with someone I swore I was \"just being nice\" to. Your move." },
      { points: 400, text: "Never have I ever fudged how many people I've dated, my relationship status, or how into it I was." },
      { points: 500, text: "Never have I ever had a bathroom, back seat, or \"this is my friend's place\" story this group would not let die." }
    ]
  },
  {
    id: "embarrassing",
    name: "Embarrassing Moments",
    blurb: "The cringe lives here.",
    prompts: [
      { points: 100, text: "When did you last trip, snort, or squeak in front of someone you wanted to impress?" },
      { points: 200, text: "Describe a wardrobe malfunction or a \"why is that unzipped\" moment." },
      { points: 300, text: "Tell the story of being walked in on, or walking in on something you cannot unsee. Comic version only." },
      { points: 400, text: "What's your most public rejection, or the moment you realized they were already taken?" },
      { points: 500, text: "Give us the embarrassing story your friends bring up when they want you to leave the table." }
    ]
  },
  {
    id: "red-flags",
    name: "Red Flags",
    blurb: "You saw it. You stayed.",
    prompts: [
      { points: 100, text: "What's a green flag you somehow treat like a threat?" },
      { points: 200, text: "Name a red flag you ignored because the photos were too good." },
      { points: 300, text: "What makes you close a dating app immediately, and which version of it have you dated anyway?" },
      { points: 400, text: "Describe the reddest flag you personally bring to a relationship. Own it." },
      { points: 500, text: "Describe a red flag in this room that everyone has clocked except the person wearing it. Don't use their name." }
    ]
  },
  {
    id: "road-trip",
    name: "Road Trip Chaos",
    blurb: "Aux cord, arguments, exits.",
    prompts: [
      { points: 100, text: "What's the most unhinged snack or playlist you force on a car full of hostages?" },
      { points: 200, text: "Confess a gas-station, rest-stop, or \"I'll just close my eyes\" incident from a long drive." },
      { points: 300, text: "Tell us about a fight over directions, the aux, or who was flirting at the rest stop." },
      { points: 400, text: "What's the messiest thing that has happened in a back seat you were responsible for? Story, not a diagram." },
      { points: 500, text: "Describe a trip that went so sideways the group still uses it as a threat." }
    ]
  },
  {
    id: "hookups",
    name: "Hookup Stories",
    blurb: "Funny over filthy.",
    prompts: [
      { points: 100, text: "Describe your flirting style in one sentence your friends would actually agree with." },
      { points: 200, text: "What's a line you used that somehow worked, and one that should have gotten you escorted out?" },
      { points: 300, text: "Tell a hookup story where the awkward part is the whole point. Walk-of-shame details welcome." },
      { points: 400, text: "What friends-with-benefits situation got way too complicated? First names optional." },
      { points: 500, text: "Give the one-sentence version of your wildest adult hookup. Funny over filthy. No play-by-play." }
    ]
  },
  {
    id: "roommates",
    name: "Roommate Wars",
    blurb: "Thin walls. Labeled food.",
    prompts: [
      { points: 100, text: "Which chore do you fake, and how long have you gotten away with it?" },
      { points: 200, text: "Confess a food crime. Labeled leftovers, fridge science, or \"that was mine.\"" },
      { points: 300, text: "What's the worst thing a roommate has heard through the wall, from either side?" },
      { points: 400, text: "Tell us about a roommate's guest, a walk-in, or a sock-on-the-door failure." },
      { points: 500, text: "What's the nuclear option you've considered in a roommate fight? Say whether you used it." }
    ]
  },
  {
    id: "exes",
    name: "Exes",
    blurb: "They're still in the phone.",
    prompts: [
      { points: 100, text: "Describe an ex in three words that ex would dispute." },
      { points: 200, text: "What's a petty thing you did after a breakup that you're only a little sorry about?" },
      { points: 300, text: "Tell the story of running into an ex at the worst possible moment." },
      { points: 400, text: "What's the last thing you'd want this group to know about how an ex still lives in your phone?" },
      { points: 500, text: "Write the headline of your messiest breakup. No full legal names." }
    ]
  },
  {
    id: "family-dinner",
    name: "Family Dinner Disasters",
    blurb: "Pass the potatoes. Dodge the question.",
    prompts: [
      { points: 100, text: "What question at a family table makes you drink water like it's a competitive sport?" },
      { points: 200, text: "Confess a lie you told a relative that has now become family canon." },
      { points: 300, text: "Tell us about a dinner where someone brought up your dating life and the table went silent." },
      { points: 400, text: "What's the most inappropriate thing a relative has said about your love life in front of everyone?" },
      { points: 500, text: "Describe a family event where you had to hide a guest, a text thread, or a very obvious hickey." }
    ]
  },
  {
    id: "celebrity",
    name: "Celebrity Crush",
    blurb: "You would not be normal.",
    prompts: [
      { points: 100, text: "Name a celebrity crush you could be normal about for maybe four minutes." },
      { points: 200, text: "Who would you embarrass yourself in front of, and what's the first dumb thing you'd say?" },
      { points: 300, text: "Which celebrity could sit beside you on a long flight, and what are you accidentally confessing by hour two?" },
      { points: 400, text: "Which interview, edit, or red-carpet look rewired your brain? Adults only." },
      { points: 500, text: "If you could send one flirty, unwise message to a celebrity and then smash your phone, who is it and what does it say?" }
    ]
  },
  {
    id: "wild-dares",
    name: "Wild Dares",
    blurb: "Bonus dares. Skipping is allowed.",
    prompts: [
      { points: 100, kind: "dare", text: "Write a silly dare someone could do in the next thirty seconds without leaving the room. If you're caught, you do yours or you skip." },
      { points: 200, kind: "dare", text: "Write a pickup line. If you're caught, deliver it to the person on your left. They can veto." },
      { points: 300, kind: "dare", text: "Write a dare that is one text, selfie, or voice note to someone in this room. If you're caught, you show the send. They can tell you to delete it." },
      { points: 400, kind: "dare", text: "Write a ten-second performance: an impression, a toast, or a dramatic reading. If you're caught, you take the stage or you refuse." },
      { points: 500, kind: "dare", text: "Write the boldest in-room dare you would actually accept tonight. No nudity, no sexual contact, no leaving. If you're caught, that's the dare. Skipping is allowed." }
    ]
  },
  {
    id: "group-chat",
    name: "Group Chat Crimes",
    blurb: "Screenshots live forever.",
    prompts: [
      { points: 100, text: "What typo did you send that changed the whole tone of a conversation?" },
      { points: 200, text: "Confess a screenshot you took, and how long you waited before sharing it." },
      { points: 300, text: "What's the pettiest thing you've said in a side chat about people you actually like?" },
      { points: 400, text: "Tell us about a voice note, a double text, or a \"sorry, wrong chat\" that nearly ended you." },
      { points: 500, text: "Describe something still in your drafts or camera roll that this group must never see. Do not open the app." }
    ]
  },
  {
    id: "party-fouls",
    name: "Party Fouls",
    blurb: "The host will find out.",
    prompts: [
      { points: 100, text: "What's your signature move that either clears a dance floor or saves it?" },
      { points: 200, text: "Confess the last time you overstayed, under-brought, or ate the host's secret snacks." },
      { points: 300, text: "Tell a story about losing a shoe, falling asleep, or tapping out too early at a party." },
      { points: 400, text: "What's the flirtiest thing you've done at a party and immediately pretended was an accident?" },
      { points: 500, text: "Describe a party foul you committed that the host still doesn't know was you." }
    ]
  },
  {
    id: "text-fails",
    name: "Text Fails",
    blurb: "Sent. Regretted. Archived.",
    prompts: [
      { points: 100, text: "What autocorrect made you look unhinged?" },
      { points: 200, text: "Describe a text you sent to the wrong person and the damage control that followed." },
      { points: 300, text: "Paraphrase the thirstiest text you've sent that you would not read in your real voice." },
      { points: 400, text: "Tell us about a left-on-read, a double-text spiral, or a \"you up?\" you still think about." },
      { points: 500, text: "Describe a text thread that would end you if it got screenshotted. No full names." }
    ]
  },
  {
    id: "after-midnight",
    name: "After Midnight",
    blurb: "The night said yes.",
    prompts: [
      { points: 100, text: "What have you ordered, posted, or messaged after midnight that arrived like a jump scare?" },
      { points: 200, text: "Describe a \"quick stop\" that lasted until sunrise." },
      { points: 300, text: "What started as \"we're just talking\" and ended as a story?" },
      { points: 400, text: "Confess a purchase, a haircut, a piercing, or a message you approved because the night said yes." },
      { points: 500, text: "What's the most adult, ill-advised yes you've given after midnight? Headline only." }
    ]
  }
];

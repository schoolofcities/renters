# Coding rubric: do Canadian rent headlines give context?

Input: `recode_input.json` – 292 news headlines (id, direction, headline, outlet, date). `direction` is already
decided: `falling` = the headline says rents are falling/easing; `rising` = the headline says rents are rising.
Judge ONLY the headline text (plus outlet/date as a hint); do not open links.

For every headline return three things.

## 1. relevant (true/false)
`false` if ANY of these hold (give a one-phrase reason):
- **not_canada** – about rents outside Canada (US, UK, Australia, Europe, Turkey…), or a foreign story carried by a
  Canadian outlet. When the place is not named, assume Canada.
- **not_a_rent_trend** – not about the level or movement of rents in the housing market: roundup/newsletter items with
  many topics, a single named person's hardship, a landlord PR incident, US/other inflation stories, etc.
Otherwise `true`.

## 2. core (true/false): "some context" – the strict reading
The headline itself *qualifies or calibrates* its direction, i.e. it tells the reader something that changes how big or
how lasting the move should feel. TRUE if the headline says any of:
1. **Scale** – the change is small / slight / modest / slowing / moderating / cooling (e.g. "down slightly",
   "rent growth slows", "rise less than inflation"). A number by itself ("down 7 per cent") is NOT scale context.
2. **Level vs a benchmark that tempers the move** –
   falling: rents are still high, still above an earlier year/level, only back to an earlier level, or are falling *from a peak*
   ("still above 2022 levels", "from pandemic highs", "back to 2019 rates", "but remains highest in Canada").
   rising: rents are still affordable/low, still below an earlier level, or only recovering.
3. **Uneven / opposite trend** – the opposite is happening elsewhere or for some people ("but not for everyone",
   "many tenants not feeling relief", "falling in X, rising in Y", "but tenants vulnerable to steep hikes").
4. **Affordability qualifier** – the headline says affordability remains a problem *despite* falling rents, or that rents are still
   affordable despite rising. Hardship stories that merely follow from rising rents ("rising rents hit minimum-wage earners")
   are NOT context – they are the consequence of the headline's own claim, not a qualifier of it.

These do NOT count as core context, however informative: record / all-time highs, "highest since…", multi-year totals,
streaks ("ninth straight month"), "N-month low", "first time since…", rankings between cities ("second only to Vancouver"),
statements that rents are high/unaffordable in a rising story, causes ("as supply surges", "due to immigration caps"),
or a bare number.

## 3. broad (true/false): "some context" – the generous reading
`broad` is TRUE if `core` is TRUE, OR if the headline explicitly places the move against a time benchmark beyond the latest
period, even when that only reinforces the direction: record / all-time / new highs or lows, "highest/lowest since…",
"largest drop in N years", "first time since…/in N years", "Nth straight month", "N-month low/high", changes over several
years ("up 27% in 4 years", "since 2019", "in the past decade"), "from pandemic highs". A plain year-over-year
change or a plain monthly number is NOT a benchmark.

## Output
Write a JSON array to the path you are given, one object per headline, every id present:
`{"id": "H00159", "relevant": true, "irrelevant_reason": "", "core": true, "broad": true, "why": "<=12 words"}`
Be consistent: the same kind of phrase gets the same label in `rising` and `falling` headlines. When truly unsure
about `core`, choose false (strict reading) and mention "unsure" in `why`.

## How the final labels were produced
Two independent codings of all 292 headlines under this rubric: one by the analyst (Claude, working through the list), one by a second
Claude agent blind to the first. They agreed on every field for 85% of headlines. Disagreements were resolved in favour of the reading
that finds more context (so the "few headlines give context" finding is not inflated), except that vacancy-rate benchmarks
(H02525, H02532) and a "since 2019" figure published in May 2020 (H00738, effectively year-over-year) are not counted as rent benchmarks.
Headlines were also dropped if either coder judged them out of scope; H01154 (a Conversation piece on Australian listings, checked in the article text).
Final columns are in `headline_context_for_review.csv`: `relevant`, `exclusion_reason`, `some_context` (core), `broad_context`, `context_tags`.

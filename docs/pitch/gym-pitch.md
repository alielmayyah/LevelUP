# Gym pitch: talking to a gym owner

A 15-minute meeting with an owner of a gym that already runs InBody scans. It is built on Plan v2's pitch (pages 8–9 of `docs/LevelUP-Business-Technical-Plan-v2.pdf`), corrected by the redesign plan (`docs/redesign/PLAN.md`): an honest hook, the new real-change rules, and only what we can show today.

**The rule: talk about their money, not our software.** The owner pays; members use it free. Every minute should point at re-scans they can charge for and personal-training (PT) sales they can make.

| Step | Time | Goal |
|---|---|---|
| 1. Hook | 1 min | A member who almost quit because they couldn't read the sheet |
| 2. Questions | 4 min | Their numbers, written down |
| 3. Demo | 3 min | The owner holds the phone and sees their own logo |
| 4. Money line | 2 min | The math, with their own prices |
| 5. Close | 5 min | A free 60-day pilot with a goal and a price agreed now |

---

## Before the meeting

- **Brand the demo for them.** Set their logo and brand color the night before (`brand.config.ts`: `gym.logo`, `gym.brand`). The app re-colors its buttons and highlights; the green, amber and grey meaning colors stay the same.
- **Bring:**
  - your phone with the app signed in as Karim (Fit ID 104: three real-looking scans, the corrected InBody example);
  - a printed one-page pilot agreement with the price filled in;
  - this sheet, to write their answers on.
- **Know what's real today** (see "What not to promise" at the end).

---

## 1. The hook (1 minute)

Tell it as an example member, not as a real person, until a pilot gives you a real story with the member's permission.

> «تخيّل عضو عندك عمل 3 قياسات InBody في 3 شهور ونص. الميزان نزل كيلو واحد بس، فافتكر إن مفيش فايدة وكان هيبطّل. الحقيقة إن عضله زاد كيلو ودهونه قلّت 2.3 كيلو. جسمه اتغيّر، هو بس ما كانش عارف يقرا الورقة.»

> "Picture a member who took three InBody scans in three and a half months. The scale dropped just one kilo, so he thought it wasn't working and was about to quit. In fact he gained a kilo of muscle and lost 2.3 kilos of fat. His body changed; he just couldn't read the sheet."

Why this story: it is physically consistent (fat % falls from 21.8% to 19.2%), and the change is bigger than the machine's measurement noise (about 0.9 kg for muscle and 1.5 kg for fat on an InBody 770). Plan v2's original hook ("same fat %, +1.1 kg muscle, −0.9 kg fat") can't happen and a nutritionist would catch it, so don't use it.

---

## 2. Five questions (4 minutes, write the answers down)

1. **Scans:** How much do you charge per scan? How many scans a month?
2. **Coming back:** Out of 10 members who scan, how many come back for a second scan?
3. **PT:** What does a PT or nutrition package cost? How do your trainers find clients today?
4. **The sheet:** Who explains the sheet to the member today, and how long does it take?
5. **The machine:** Which InBody model, and does it run LookinBody on a PC? Can you export a test as a CSV file?

The answers feed the money line. Question 5 decides how scans will get into the app; ask to see an export if they have one, because we still need one real file to build the import.

---

## 3. The demo (3 minutes)

**Hand the owner your phone.** Seeing their own logo on a good-looking screen sells better than any sentence.

1. **Home:** the verdict comes first, in plain Egyptian Arabic: «وزنك نزل كيلو، بس الأهم إن جسمك اتغيّر: عضل أكتر ودهون أقل.» Then the change since the first scan: muscle +1.0 kg, fat −2.3 kg.
2. **The scan report:** each number sits on its normal range with one word ("normal", "a bit high"). Tap any number to see what it means.
3. **The honest part:** the last scan against the one before it shows "about the same", because +0.5 kg is inside the machine's noise. Say it out loud:
   > «إحنا ما بنكدبش على العضو. لو التغيير أصغر من فرق الجهاز، بنقوله "تقريباً زي ما هو"، ونوريله الاتجاه من أول قياس.»
   > "We never oversell. If a change is smaller than the machine's error, we say 'about the same' and show the trend since the first scan."
   This is what makes members trust the app, and it is why trainers' leads are real.
4. **The next step:** every result ends with one action: book the next scan, or talk to your coach on WhatsApp. That button is the gym's sale.

---

## 4. The money line (2 minutes, with their numbers)

> «كل عضو هيجيله تذكير يعيد القياس كل 4 لـ 6 أسابيع، والمدربين بتوعك هياخدوا ليستة بالناس اللي محتاجة برايفت، ومع كل اسم السبب. لو 8 أعضاء بس رجعوا يقيسوا في الشهر، الاشتراك دفع تمنه.»

> "Every member gets a reminder to re-scan every 4–6 weeks, and your trainers get a list of people who could use PT, each with a reason. If just 8 members come back for a scan each month, the plan has paid for itself."

Do the math on paper with their answers:

| | Their number | Example |
|---|---|---|
| Price per scan | ____ | EGP 150 |
| Extra re-scans a month | ____ | 8 |
| **Re-scan revenue** | ____ | **EGP 1,200** |
| PT packages sold from leads | ____ | 1 × EGP 3,000 |
| **Total a month** | ____ | **EGP 4,200** |
| Plan price | | Starter EGP 990 · Pro EGP 2,490 |

Even with no PT sale, re-scans alone cover the Starter plan.

**What makes it pay** (strongest first):
1. **Paid re-scans:** reminders bring members back every 4–6 weeks, with the right conditions ("3 hours after eating, no workout, same time as last time"), so scans are comparable.
2. **PT and nutrition leads:** trainers get members to call, each with a reason. A lead is raised only when a change is real (for example, a muscle drop of about 0.9 kg or more, or two drops in a row), so trainers don't call people over noise.
3. **Transformation packages:** "3 scans in 3 months with a trainer review" becomes a product the gym can sell.

**Keep as the story, not the proof:** retention (members who see progress cancel less; 60 days is too short to prove it), share cards with the gym's logo, and "we have our own app".

**Leave out:** "saves paper and staff time". It's a member benefit, not a saving the owner will feel.

---

## 5. The close (5 minutes)

> «جرّبه 60 يوم ببلاش. هنتفق دلوقتي على هدف واضح وعلى السعر بعد التجربة. لو ما جابلكش أكتر من تمنه، ما تدفعش.»

> "Try it free for 60 days. We agree now on a clear goal and the price after the pilot. If it doesn't bring you more than it costs, you don't pay."

**The one-page pilot agreement:**

| | |
|---|---|
| Goal | e.g. +20 re-scans or 10 PT leads in 60 days |
| Price after day 60 | written in, with a pilot discount |
| The gym does | sends every scan the same day; puts up the sign-up QR code at the desk |
| We do | onboarding visit, import past scans, weekly check-in |
| Day 60 | review the numbers together, convert to paid, ask for 2 referrals |

**Pricing** (Plan v2; hypotheses to test in pilots, not market prices):

| Plan | Price | For |
|---|---|---|
| Pilot | Free, 60 days | Up to 100 members, all features, paid price agreed in writing first |
| Starter | EGP 990 / branch / month | Single-branch gyms, up to 150 active members |
| Pro | EGP 2,490 / branch / month | Unlimited members, gym logo on share cards, trainer lead list, owner stats |
| Pay per scan | EGP 15 / scan, bundles of 100 | Nutritionists and small clinics |

Yearly plans get about 2 months free. Gyms that sign during the pilot get a lower price.

---

## Objections

| They say | You answer |
|---|---|
| "My staff are too busy." | Sending a scan should take under a minute, or one batch at the end of the day. Nothing to install on their side beyond what the machine already has. |
| "Members won't download an app." | Members sign in with their phone number and their scans are already waiting. A QR code at the desk; a web version for people who won't install. |
| "We already have gym software." | We don't replace it. We do the part it doesn't: explaining the scan and turning it into re-scans and PT sales. |
| "It's expensive." | Run the math with their scan price. Then offer the pilot: "If it doesn't bring you more than it costs, don't pay." |
| "What about member privacy?" | Members give consent; the gym sees only its own members' scans; members can ask for their data to be deleted. The app says "fitness information, not a medical diagnosis" and never names a disease. |
| "InBody has its own app." | Ours is in Egyptian Arabic, carries the gym's logo, explains each number in plain words, and gives trainers leads. Check what InBody's app offers in Egypt before claiming more. |
| "What if the numbers go the wrong way?" | We never use red on a body number. A drop shows in neutral or amber words with one next step, usually "talk to your coach". That is a sales conversation, not a bad review. |

---

## What not to promise yet

Be straight about this; overselling to a first pilot is the fastest way to lose it.

- **Live today:** the member app as a working demo with sample members (the redesign is in progress). There is no backend yet, so no real member can log in.
- **Not built yet:** the staff dashboard (scan upload, the trainer lead list, owner stats), CSV import, phone-number login with WhatsApp codes, push reminders, share cards. Say "in the pilot", and agree dates only after the backend plan is fixed.
- **Not decided yet:** integrations with gym software (Fit Boost, Rakiz, SigmaGym) are ideas, not deals. Don't name them as partners.
- **Ask a lawyer first:** the consent age for under-18 members, and the data-protection licence under Egypt's Law 151/2020.

---

## After the meeting

- Write down their five answers the same day.
- If they said yes: send the agreement, ask for one real CSV export, and book the onboarding visit.
- If they said no: ask what would have made it a yes, and whether you can come back after the first pilot with real numbers.
